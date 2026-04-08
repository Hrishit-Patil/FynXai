import os
import shutil
import json
import glob
import time
import tempfile
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Try importing the OCR module
try:
    from ocr import DocumentOCR
    print("[Startup] Successfully imported DocumentOCR module")
except ImportError as e:
    print(f"[Startup] CRITICAL ERROR: Could not import ocr.py. Error: {e}")

# Load environment variables
load_dotenv()

# Setup Supabase
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
# Use Service Role Key to bypass RLS
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[Config] ❌ Error: Supabase credentials missing")
    
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("[Config] ✅ Supabase Client Initialized (Admin Access)")
except Exception as e:
    print(f"[Config] ❌ Supabase Connection Failed: {e}")

def process_loan_application(loan_id):
    """
    Standard processing function (Initial Application)
    """
    print(f"\n[OCR Service] 🚀 Processing started for Application ID: {loan_id}")
    run_full_processing(loan_id, "initial")

def reprocess_all_documents(loan_id):
    """
    Re-processes ALL documents.
    Used when a user updates a single document (e.g. Bank Statement).
    """
    print(f"\n[OCR Service] 🔄 Re-processing ALL docs for update: {loan_id}")
    run_full_processing(loan_id, "update")

def run_full_processing(loan_id, mode):
    """
    Shared logic to download ALL files, run OCR, and UPDATE DB.
    """
    # 1. Fetch Loan Details
    try:
        response = supabase.table('loans').select('*').eq('application_id', loan_id).execute()
        if not response.data:
            print("[OCR Service] ❌ Loan Application not found.")
            return
        
        loan_data = response.data[0]
        document_urls = loan_data.get('document_urls', {})

    except Exception as e:
        print(f"[OCR Service] ❌ DB Error: {e}")
        return

    # Use SYSTEM TEMP DIR
    sys_temp = Path(tempfile.gettempdir())
    temp_input_dir = sys_temp / f"fynxai_in_{loan_id}_{int(time.time())}"
    temp_output_dir = sys_temp / f"fynxai_out_{loan_id}_{int(time.time())}"
    
    if temp_input_dir.exists(): shutil.rmtree(temp_input_dir, ignore_errors=True)
    if temp_output_dir.exists(): shutil.rmtree(temp_output_dir, ignore_errors=True)
    
    temp_input_dir.mkdir(parents=True, exist_ok=True)
    temp_output_dir.mkdir(parents=True, exist_ok=True)

    try:
        # 2. Download ALL Files found in DB
        print(f"[OCR Service] 📥 Downloading all documents...")
        download_count = 0
        original_sizes = {} # NEW: Track file sizes to detect AI swapping
        
        for doc_type, file_path in document_urls.items():
            if not file_path: continue
            
            try:
                ext = Path(file_path).suffix
                local_name = f"{doc_type}{ext}"
                local_path = temp_input_dir / local_name
                
                with open(local_path, 'wb') as f:
                    res = supabase.storage.from_('loan_documents').download(file_path)
                    f.write(res)
                
                # Record the exact byte size of the downloaded file
                original_sizes[doc_type] = local_path.stat().st_size
                download_count += 1
            except Exception as e:
                print(f"[OCR Service] ⚠️ Failed download {doc_type}: {e}")

        if download_count == 0:
            print("[OCR Service] ❌ No files downloaded.")
            return

        # 3. Run OCR Engine
        print("[OCR Service] 🧠 Running OCR Engine on FULL set...")
        ocr_engine = DocumentOCR(
            images_dir=str(temp_input_dir),
            output_dir=str(temp_output_dir),
            auto_rename=True 
        )
        
        # --- NEW: SMART UI SYNC LOGIC ---
        # If the AI swapped the files locally, we will catch it by comparing file sizes!
        if 'aadhaar_front' in original_sizes and 'aadhaar_back' in original_sizes:
            current_front_file = next(temp_input_dir.glob("aadhaar_front*"), None)
            if current_front_file:
                current_size = current_front_file.stat().st_size
                
                # If the current 'front' file has the exact size of the original 'back' file, they were swapped!
                if current_size == original_sizes['aadhaar_back'] and current_size != original_sizes['aadhaar_front']:
                    print("[OCR Service] 🔄 Aadhaar Swap Detected! Updating Database URLs to fix the UI...")
                    
                    # Swap the URLs in our dictionary
                    temp_url = document_urls['aadhaar_front']
                    document_urls['aadhaar_front'] = document_urls['aadhaar_back']
                    document_urls['aadhaar_back'] = temp_url
                    
                    # Update the Database so the Officer & Applicant Dashboards show them in the correct boxes
                    supabase.table('loans').update({
                        "document_urls": document_urls
                    }).eq('application_id', loan_id).execute()
        # --------------------------------

        # Actually run the extraction
        ocr_engine.run()

        # 4. Read Results
        ocr_json_content = None
        model_json_content = None
        
        json_files = list(temp_output_dir.glob("*.json"))
        
        if not json_files:
            print("[OCR Service] ⚠️ No JSON output generated.")
        else:
            for json_file in json_files:
                filename = json_file.name
                if filename.startswith("Final_"):
                    with open(json_file, 'r', encoding='utf-8') as f:
                        model_json_content = json.load(f)
                else:
                    with open(json_file, 'r', encoding='utf-8') as f:
                        ocr_json_content = json.load(f)

        # 5. Insert or Update Database
        if ocr_json_content or model_json_content:
            print("[OCR Service] 💾 Saving data to 'xai_data' table...")
            xai_payload = {
                "application_id": loan_id,
                "ocr_json": ocr_json_content,     
                "model_json": model_json_content, 
                "status": "done"
            }
            try:
                existing = supabase.table('xai_data').select('explanation_id').eq('application_id', loan_id).execute()
                
                if existing.data and len(existing.data) > 0:
                    print("[OCR Service] 🔄 Updating existing XAI record...")
                    supabase.table('xai_data').update(xai_payload).eq('application_id', loan_id).execute()
                else:
                    print("[OCR Service] ➕ Creating new XAI record...")
                    supabase.table('xai_data').insert(xai_payload).execute()
                
                print("[OCR Service] ✅ Data successfully saved!")
                
                # Logic for Update Mode
                if mode == "update":
                    supabase.table('loans').update({
                        "loan_status": "under_review",
                        "officer_decision": None 
                    }).eq('application_id', loan_id).execute()
                    
                    # Trigger Scoring
                    from scoring_service import calculate_credit_score
                    print("[OCR Service] ➡️ Triggering Re-Scoring...")
                    calculate_credit_score(loan_id)
                    
            except Exception as db_err:
                 print(f"[OCR Service] ❌ Failed to save to xai_data: {db_err}")
        else:
            print("[OCR Service] ❌ Failed to read valid JSON content.")

    except Exception as e:
        print(f"[OCR Service] ❌ Process Failure: {e}")
        import traceback
        traceback.print_exc()
    finally:
        try:
            if temp_input_dir.exists(): shutil.rmtree(temp_input_dir, ignore_errors=True)
            if temp_output_dir.exists(): shutil.rmtree(temp_output_dir, ignore_errors=True)
        except Exception as cleanup_err:
            print(f"[OCR Service] ⚠️ Cleanup Warning: {cleanup_err}")