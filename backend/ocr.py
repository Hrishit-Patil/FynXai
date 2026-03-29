import os
import re
import cv2
import json
import easyocr
import shutil
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict
import PyPDF2
import pdfplumber


class DocumentOCR:
    def __init__(self, images_dir="images", output_dir="outputs", auto_rename=True):
        """Initialize with configurable directories

        Args:
            images_dir: Directory containing input documents (default: 'images')
            output_dir: Directory to save output files (default: 'outputs')
            auto_rename: Automatically detect and rename files (default: True)
        """
        self.reader = easyocr.Reader(['en'])
        self.images_dir = Path(images_dir)
        self.output_dir = Path(output_dir)
        self.auto_rename = auto_rename
        self.extracted_name = None
        self.aadhaar_father_name = None


        self.output_dir.mkdir(parents=True, exist_ok=True)


        if auto_rename:
            self._detect_and_rename_files()


        self.document_files = self._auto_detect_files()

    def _get_image_text_for_detection(self, image_path):
        """Quick OCR scan to get text for document type detection"""
        try:
            img = cv2.imread(str(image_path))
            if img is None:
                return ""


            height, width = img.shape[:2]
            if width > 800:
                scale = 800 / width
                img = cv2.resize(img, (int(width * scale), int(height * scale)))

            results = self.reader.readtext(img, paragraph=True)
            text = ' '.join([r[1] for r in results])
            return text.upper()
        except:
            return ""

    def _detect_document_type(self, file_path):
        """Detect document type by analyzing content

        Returns: 'aadhaar_front', 'aadhaar_back', 'pan', or None
        """
        file_ext = file_path.suffix.lower()


        if file_ext in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
            text = self._get_image_text_for_detection(file_path)


            aadhaar_indicators = ['AADHAAR', 'आधार', 'UIDAI', 'UNIQUE IDENTIFICATION',
                                  'GOVERNMENT OF INDIA', 'भारत सरकार']
            is_aadhaar = any(ind in text for ind in aadhaar_indicators)


            has_aadhaar_number = bool(re.search(r'\d{4}\s*\d{4}\s*\d{4}', text))

            if is_aadhaar or has_aadhaar_number:

                address_indicators = ['S/O', 'D/O', 'C/O', 'W/O', 'ADDRESS', 'पता',
                                     'DIST', 'PIN', 'STATE', 'PO:']
                has_address = any(ind in text for ind in address_indicators)


                front_indicators = ['DOB', 'MALE', 'FEMALE', 'पुरुष', 'महिला',
                                   'DATE OF BIRTH', 'जन्म तिथि']
                has_front_info = any(ind in text for ind in front_indicators)

                if has_address and not has_front_info:
                    return 'aadhaar_back'
                else:
                    return 'aadhaar_front'


            pan_indicators = ['INCOME TAX', 'PERMANENT ACCOUNT', 'PAN',
                            'GOVT. OF INDIA', 'आयकर विभाग']
            has_pan_format = bool(re.search(r'[A-Z]{5}\d{4}[A-Z]', text))

            if any(ind in text for ind in pan_indicators) or has_pan_format:
                return 'pan'


        return None

    def _detect_and_rename_files(self):
        """Detect document types and rename files to standard naming"""
        if not self.images_dir.exists():
            print(f"Warning: Images directory '{self.images_dir}' not found!")
            return

        print("\n Detecting document types...")


        renamed_files = []


        all_files = list(self.images_dir.iterdir())

        for file_path in all_files:
            if file_path.is_dir():
                continue


            file_name_lower = file_path.name.lower()
            standard_names = ['aadhaarfront', 'aadhaar_front', 'aadharback', 'aadhaar_back',
                            'pancard', 'pan_card', 'payslip', 'bank_statement', 'bankstatement']

            if any(std in file_name_lower for std in standard_names):
                print(f"   {file_path.name} (already named correctly)")
                continue


            doc_type = self._detect_document_type(file_path)

            if doc_type:

                ext = file_path.suffix

                if doc_type == 'aadhaar_front':
                    new_name = f"aadhaar_front{ext}"
                elif doc_type == 'aadhaar_back':
                    new_name = f"aadhaar_back{ext}"
                elif doc_type == 'pan':
                    new_name = f"pan_card{ext}"
                else:
                    continue

                new_path = self.images_dir / new_name


                if new_path != file_path and not new_path.exists():
                    shutil.move(str(file_path), str(new_path))
                    print(f"   {file_path.name} → {new_name} ({doc_type})")
                    renamed_files.append((file_path.name, new_name, doc_type))
                elif new_path.exists():
                    print(f"   {file_path.name} → {new_name} (file exists, skipped)")
            else:
                print(f"   {file_path.name} (unknown document type)")

        if renamed_files:
            print(f"\n Renamed {len(renamed_files)} files")
        else:
            print(f"\n All files already have standard names")

        aadhaar_front_file = None
        aadhaar_back_file = None

        for file_path in self.images_dir.iterdir():
            if file_path.is_dir():
                continue
            name_lower = file_path.name.lower()
            if any(x in name_lower for x in ['aadhaarfront', 'aadhaar_front', 'aadhar_front', 'aadhaar-front']):
                aadhaar_front_file = file_path
            elif any(x in name_lower for x in ['aadhaarback', 'aadhaar_back', 'aadharback', 'aadhar_back', 'aadhaar-back']):
                aadhaar_back_file = file_path

        if aadhaar_front_file and aadhaar_back_file:
            front_detected = self._detect_document_type(aadhaar_front_file)
            back_detected = self._detect_document_type(aadhaar_back_file)

            if front_detected == 'aadhaar_back' and back_detected == 'aadhaar_front':
                front_ext = aadhaar_front_file.suffix
                back_ext = aadhaar_back_file.suffix
                temp_path = self.images_dir / f"_temp_aadhaar_swap{front_ext}"

                shutil.move(str(aadhaar_front_file), str(temp_path))
                shutil.move(str(aadhaar_back_file), str(self.images_dir / f"aadhaar_front{back_ext}"))
                shutil.move(str(temp_path), str(self.images_dir / f"aadhaar_back{front_ext}"))

                print(f"\n   Aadhaar sides were swapped! Corrected: {aadhaar_front_file.name} <-> {aadhaar_back_file.name}")
            else:
                print(f"\n   Aadhaar card sides verified correctly")
        elif aadhaar_front_file:
            front_detected = self._detect_document_type(aadhaar_front_file)
            if front_detected == 'aadhaar_back':
                new_path = self.images_dir / f"aadhaar_back{aadhaar_front_file.suffix}"
                if not new_path.exists():
                    shutil.move(str(aadhaar_front_file), str(new_path))
                    print(f"\n   {aadhaar_front_file.name} -> aadhaar_back{aadhaar_front_file.suffix} (was actually back side)")
        elif aadhaar_back_file:
            back_detected = self._detect_document_type(aadhaar_back_file)
            if back_detected == 'aadhaar_front':
                new_path = self.images_dir / f"aadhaar_front{aadhaar_back_file.suffix}"
                if not new_path.exists():
                    shutil.move(str(aadhaar_back_file), str(new_path))
                    print(f"\n   {aadhaar_back_file.name} -> aadhaar_front{aadhaar_back_file.suffix} (was actually front side)")


    def _auto_detect_files(self):
        """Automatically detect and categorize files in the images directory"""
        files = {
            'aadhaar_front': None,
            'aadhaar_back': None,
            'pan': None,
            'payslips': [],
            'bank_statement': None
        }

        if not self.images_dir.exists():
            print(f"Warning: Images directory '{self.images_dir}' not found!")
            return files

        for file_path in self.images_dir.iterdir():
            file_name = file_path.name.lower()


            if any(x in file_name for x in ['aadhaarfront', 'aadhaar_front', 'aadhar_front', 'aadhaar-front']):
                files['aadhaar_front'] = file_path

            elif any(x in file_name for x in ['aadhaarback', 'aadhaar_back', 'aadharback', 'aadhar_back', 'aadhaar-back']):
                files['aadhaar_back'] = file_path

            elif any(x in file_name for x in ['pan', 'pancard']):
                files['pan'] = file_path

            elif any(x in file_name for x in ['payslip', 'salary_slip', 'salaryslip', 'pay_slip', 'salary slip', 'pay slip']):
                files['payslips'].append(file_path)

            elif any(x in file_name for x in ['bank', 'statement', 'bank_statement']):
                files['bank_statement'] = file_path


        files['payslips'].sort(key=lambda x: x.name)

        return files

    def check_files(self):
        """Check which files are present and report status"""
        missing = []
        found = []

        if self.document_files['aadhaar_front']:
            found.append(f"Aadhaar Front: {self.document_files['aadhaar_front'].name}")
        else:
            missing.append("Aadhaar Front")

        if self.document_files['aadhaar_back']:
            found.append(f"Aadhaar Back: {self.document_files['aadhaar_back'].name}")
        else:
            missing.append("Aadhaar Back")

        if self.document_files['pan']:
            found.append(f"PAN Card: {self.document_files['pan'].name}")
        else:
            missing.append("PAN Card")

        if self.document_files['payslips']:
            for p in self.document_files['payslips']:
                found.append(f"Payslip: {p.name}")
        else:
            missing.append("Payslips")

        if self.document_files['bank_statement']:
            found.append(f"Bank Statement: {self.document_files['bank_statement'].name}")
        else:
            missing.append("Bank Statement")

        print("\nFiles Found:")
        for f in found:
            print(f"   {f}")

        if missing:
            print(f"\nMissing Files: {', '.join(missing)}")
            return False

        print("\nAll required files are present!")
        return True

    def extract_text_lines(self, image_path, try_both_resolutions=False):
        """Extract text lines from an image using OCR"""
        img_original = cv2.imread(str(image_path))
        if img_original is None:
            return []

        height, width = img_original.shape[:2]


        img = img_original.copy()
        if width < 1200:
            scale = 1200 / width
            new_width = int(width * scale)
            new_height = int(height * scale)
            img = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_LANCZOS4)

        results = self.reader.readtext(img, paragraph=False)

        sorted_results = sorted(results, key=lambda x: (x[0][0][1], x[0][0][0]))

        text_lines = []
        for (bbox, text, confidence) in sorted_results:
            if confidence > 0.25:
                text_lines.append(text.strip())


        if try_both_resolutions:
            results_orig = self.reader.readtext(img_original, paragraph=False)
            sorted_orig = sorted(results_orig, key=lambda x: (x[0][0][1], x[0][0][0]))
            for (bbox, text, confidence) in sorted_orig:
                if confidence > 0.25:
                    txt = text.strip()
                    if txt not in text_lines:
                        text_lines.append(txt)

        return text_lines

    def read_pdf_with_pdfplumber(self, pdf_path):
        """Read PDF using pdfplumber"""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                text = ""
                for page in pdf.pages:
                    text += page.extract_text() or ""
            return text
        except:
            return ""

    def read_pdf_with_pypdf2(self, pdf_path):
        """Read PDF using PyPDF2 as fallback"""
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() or ""
            return text
        except:
            return ""

    def read_pdf_text(self, pdf_path):
        """Read PDF text with multiple fallback methods"""
        content = self.read_pdf_with_pdfplumber(pdf_path)
        if not content:
            content = self.read_pdf_with_pypdf2(pdf_path)
        if not content:
            try:
                with open(pdf_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
            except:
                content = ""
        return content

    def extract_payslip_data(self, pdf_path):
        """Dynamically extract payslip data without hardcoded values"""
        content = self.read_pdf_text(pdf_path)

        data = {
            'name': None,
            'bank_account_number': None,
            'total_earnings': None,
            'total_deductions': None,
            'net_pay': None,
            'provident_fund': None,
            'basic_salary': None,
            'gross_salary': None,
            'date_of_joining': None,
            'deduction_to_gross_ratio': None,
            'employer_name': None,
            'employer_category': None
        }


        name_patterns = [
            r'Name\s*[:\s]+([A-Za-z\s]+?)(?:\s+Employee|\n|$)',
            r'Employee\s*Name\s*[:\s]+([A-Za-z\s]+?)(?:\n|$)',
            r'Name\s+of\s+Employee\s*[:\s]+([A-Za-z\s]+?)(?:\n|$)'
        ]
        for pattern in name_patterns:
            name_match = re.search(pattern, content, re.MULTILINE | re.IGNORECASE)
            if name_match:
                data['name'] = name_match.group(1).strip()
                break


        account_patterns = [
            r'Bank\s*Account\s*No[:\s.]*(\d{9,18})',
            r'Account\s*No[:\s.]*(\d{9,18})',
            r'A/C\s*No[:\s.]*(\d{9,18})',
            r'Account\s*Number[:\s.]*(\d{9,18})'
        ]
        for pattern in account_patterns:
            account_match = re.search(pattern, content, re.IGNORECASE)
            if account_match:
                data['bank_account_number'] = account_match.group(1)
                break


        earnings_match = re.search(r'Total\s*Earnings\s*[:\s]*(?:Rs\.?)?\s*(\d{5,6})', content, re.IGNORECASE)
        if earnings_match:
            data['total_earnings'] = int(earnings_match.group(1))
        else:
            earnings_fallback = re.search(r'(\d{5,6})\s*\n\s*Total\s*Earnings', content, re.IGNORECASE)
            if earnings_fallback:
                data['total_earnings'] = int(earnings_fallback.group(1))


        deductions_match = re.search(r'Total\s*Deductions\s*[:\s]*(?:Rs\.?)?\s*(\d{4,6})', content, re.IGNORECASE)
        if deductions_match:
            data['total_deductions'] = int(deductions_match.group(1))


        net_pay_match = re.search(r'Net\s*Pay.*?[:\)]\s*(\d{5,6})', content, re.IGNORECASE | re.DOTALL)
        if net_pay_match:
            data['net_pay'] = int(net_pay_match.group(1))


        if data['net_pay'] is None and data['total_earnings'] and data['total_deductions']:
            data['net_pay'] = data['total_earnings'] - data['total_deductions']


        pf_patterns = [
            r'(?:Provident\s*Fund|PF|EPF|Employee\s*PF)\s*[:\s]*(?:Rs\.?)?\s*(\d{1,6})',
            r'PF\s*Contribution\s*[:\s]*(?:Rs\.?)?\s*(\d{1,6})',
            r'EPF\s*[:\s]*(?:Rs\.?)?\s*(\d{1,6})'
        ]
        for pattern in pf_patterns:
            pf_match = re.search(pattern, content, re.IGNORECASE)
            if pf_match:
                data['provident_fund'] = int(pf_match.group(1))
                break


        basic_patterns = [
            r'Basic\s*(?:Salary)?\s*[:\s]*(?:Rs\.?)?\s*(\d{4,6})',
            r'Basic\s*Pay\s*[:\s]*(?:Rs\.?)?\s*(\d{4,6})'
        ]
        for pattern in basic_patterns:
            basic_match = re.search(pattern, content, re.IGNORECASE)
            if basic_match:
                data['basic_salary'] = int(basic_match.group(1))
                break


        gross_patterns = [
            r'Gross\s*(?:Salary|Pay|Earnings)\s*[:\s]*(?:Rs\.?)?\s*(\d{4,6})',
            r'Total\s*Gross\s*[:\s]*(?:Rs\.?)?\s*(\d{4,6})'
        ]
        for pattern in gross_patterns:
            gross_match = re.search(pattern, content, re.IGNORECASE)
            if gross_match:
                data['gross_salary'] = int(gross_match.group(1))
                break


        if data['gross_salary'] is None and data['total_earnings']:
            data['gross_salary'] = data['total_earnings']


        doj_patterns = [

            r'(?:Joining\s*Date|Date\s*of\s*Joining|DOJ)\s*[:\s]*(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})',

            r'(?:Joining\s*Date|Date\s*of\s*Joining|DOJ)\s*[:\s]*(\d{1,2}[/-][A-Za-z]{3}[/-]\d{4})',

            r'(?:Joining\s*Date|Date\s*of\s*Joining|DOJ)\s*[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{4})',

            r'(?:Joining\s*Date|Date\s*of\s*Joining|DOJ)\s*[:\s]*(\d{4}[/-]\d{1,2}[/-]\d{1,2})'
        ]
        for pattern in doj_patterns:
            doj_match = re.search(pattern, content, re.IGNORECASE)
            if doj_match:
                data['date_of_joining'] = doj_match.group(1).strip()
                break


        if data['total_deductions'] and data['gross_salary'] and data['gross_salary'] > 0:
            data['deduction_to_gross_ratio'] = round((data['total_deductions'] / data['gross_salary']) * 100, 2)


        employer_patterns = [
            r'^([A-Z][A-Za-z\s]+(?:Limited|Ltd|Pvt|Private|Corporation|Corp|Inc|Technologies|Tech|Solutions|Services|India|Infotech|Infosys|TCS|Wipro|HCL|Cognizant|Accenture|Capgemini)[A-Za-z\s]*)',
            r'Company\s*[:\s]*([A-Za-z\s]+(?:Limited|Ltd|Pvt|Private|Corporation|Corp|Inc))',
            r'Employer\s*[:\s]*([A-Za-z\s]+)',
            r'Organization\s*[:\s]*([A-Za-z\s]+)'
        ]
        for pattern in employer_patterns:
            employer_match = re.search(pattern, content, re.MULTILINE | re.IGNORECASE)
            if employer_match:
                employer = employer_match.group(1).strip()

                employer = employer.split('\n')[0].strip()

                if len(employer) > 3 and not any(skip in employer.lower() for skip in ['payslip', 'salary', 'slip', 'month', 'plot']):
                    data['employer_name'] = employer.title()
                    break


        if data['employer_name']:
            employer_upper = data['employer_name'].upper()


            cat_a_keywords = ['INFOSYS', 'TCS', 'TATA CONSULTANCY', 'WIPRO', 'HCL', 'COGNIZANT',
                             'ACCENTURE', 'CAPGEMINI', 'IBM', 'MICROSOFT', 'GOOGLE', 'AMAZON',
                             'META', 'FACEBOOK', 'APPLE', 'ORACLE', 'SAP', 'DELOITTE', 'KPMG',
                             'EY', 'PWC', 'ERNST', 'MCKINSEY', 'BCG', 'BAIN', 'JPMORGAN',
                             'GOLDMAN', 'MORGAN STANLEY', 'CITI', 'HSBC', 'BARCLAYS',
                             'GOVERNMENT', 'GOVT', 'PSU', 'PUBLIC SECTOR', 'BHEL', 'ONGC',
                             'IOCL', 'BPCL', 'HPCL', 'NTPC', 'SAIL', 'GAIL', 'COAL INDIA',
                             'SBI', 'STATE BANK', 'RBI', 'RESERVE BANK', 'LIC', 'GIC',
                             'AIRBUS', 'BOEING', 'SIEMENS', 'GE', 'GENERAL ELECTRIC',
                             'SAMSUNG', 'INTEL', 'NVIDIA', 'AMD', 'QUALCOMM', 'CISCO',
                             'DELL', 'HP', 'LENOVO', 'SONY', 'PANASONIC', 'LG', 'PHILIPS']


            cat_b_keywords = ['PRIVATE', 'PVT', 'LIMITED', 'LTD', 'CORPORATION', 'CORP',
                             'TECHNOLOGIES', 'TECH', 'SOLUTIONS', 'SERVICES', 'INFOTECH',
                             'SOFTWARE', 'SYSTEMS', 'CONSULTING', 'INDUSTRIES', 'ENTERPRISES']

            cat_c_keywords = ['STARTUP', 'VENTURES', 'LABS', 'STUDIO', 'HUB', 'WORKS']

            if any(kw in employer_upper for kw in cat_a_keywords):
                data['employer_category'] = 'Category A (MNC/Govt/PSU)'
            elif any(kw in employer_upper for kw in cat_c_keywords):
                data['employer_category'] = 'Category C (Startup)'
            elif any(kw in employer_upper for kw in cat_b_keywords):
                data['employer_category'] = 'Category B (Established Pvt)'
            else:
                data['employer_category'] = 'Category B (Established Pvt)'

        return data

    def _extract_month_from_filename(self, filename):
        """Extract month and year from payslip filename - returns Month-YY format"""
        month_names = {
            'jan': 'January', 'feb': 'February', 'mar': 'March',
            'apr': 'April', 'may': 'May', 'jun': 'June',
            'jul': 'July', 'aug': 'August', 'sep': 'September',
            'oct': 'October', 'nov': 'November', 'dec': 'December',
            'january': 'January', 'february': 'February', 'march': 'March',
            'april': 'April', 'june': 'June', 'july': 'July',
            'august': 'August', 'september': 'September', 'october': 'October',
            'november': 'November', 'december': 'December'
        }

        filename_lower = filename.lower()


        for short, full in month_names.items():
            if short in filename_lower:

                year_match = re.search(r'20(\d{2})', filename_lower)
                if year_match:
                    year_short = year_match.group(1)
                else:

                    year_match = re.search(r'[_-](\d{2})[_.-]', filename_lower)
                    if year_match:
                        year_short = year_match.group(1)
                    else:

                        year_short = datetime.now().strftime('%y')
                return f"{full}-{year_short}"

        return None

    def _extract_month_from_payslip_content(self, pdf_path):
        """Extract month and year from payslip content - returns Month-YY format"""
        content = self.read_pdf_text(pdf_path)


        month_pattern = r'(?:Payslip|Pay\s*slip|Salary\s*slip).*?(?:month\s*of\s*)?([A-Za-z]+)\s*(\d{4})'
        match = re.search(month_pattern, content, re.IGNORECASE)
        if match:
            month_name = match.group(1).capitalize()
            year_full = match.group(2)
            year_short = year_full[-2:]
            return f"{month_name}-{year_short}"

        return None

    def process_all_payslips(self):
        """Process all detected payslips dynamically"""
        payslips = {}

        for payslip_path in self.document_files['payslips']:

            month_key = self._extract_month_from_payslip_content(payslip_path)


            if month_key is None:
                month_key = self._extract_month_from_filename(payslip_path.name)

            if month_key is None:

                idx = self.document_files['payslips'].index(payslip_path)
                month_key = f"payslip_{idx + 1}"

            payslips[month_key] = self.extract_payslip_data(payslip_path)

        return payslips

    def parse_bank_statement(self):
        """Dynamically parse bank statement using table extraction for accuracy"""
        if not self.document_files['bank_statement']:
            return {}

        filepath = self.document_files['bank_statement']
        content = ''
        tables_data = []


        try:
            import pdfplumber
            with pdfplumber.open(filepath) as pdf:
                for page in pdf.pages:

                    page_text = page.extract_text() or ''
                    content += page_text


                    page_tables = page.extract_tables()
                    for table in page_tables:
                        tables_data.extend(table)
        except Exception:

            content = self.read_pdf_text(filepath)

        if not content:
            return {}


        account_number = None
        account_patterns = [
            r'Account\s*No\s*[:\s]*(\d{9,18})',
            r'A/C\s*No\s*[:\s]*(\d{9,18})',
            r'Account\s*Number\s*[:\s]*(\d{9,18})',
            r'Axis\s*Account\s*No\s*[:\s]*(\d{9,18})'
        ]
        for pattern in account_patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                account_number = match.group(1)
                break


        pan_number = None
        pan_match = re.search(r'PAN\s*[:\s]*([A-Z]{5}\d{4}[A-Z])', content)
        if pan_match:
            pan_number = pan_match.group(1)


        monthly_data = defaultdict(lambda: {
            'credits': [],
            'debits': [],
            'salary_transactions': [],
            'emi_transactions': [],
            'credit_card_payments': [],
            'atm_withdrawals': [],
            'bounce_charges': [],
            'gambling_transactions': [],
            'balances': [],
            'salary_dates': [],
            'post_salary_spending': []
        })


        all_transactions = []


        active_loans = set()


        if tables_data:
            for row in tables_data:
                if not row or not row[0]:
                    continue


                date_str = str(row[0]).strip()
                date_match = re.match(r'^(\d{2})-(\d{2})-(\d{4})$', date_str)
                if not date_match:
                    continue

                try:
                    date_obj = datetime.strptime(date_str, '%d-%m-%Y')
                    month_name = date_obj.strftime('%B')
                    year_short = date_obj.strftime('%y')
                    month_key = f"{month_name}-{year_short}"



                    debit_col = row[3] if len(row) > 3 else None
                    credit_col = row[4] if len(row) > 4 else None
                    balance_col = row[5] if len(row) > 5 else None
                    particulars = str(row[2] or '').upper() if len(row) > 2 else ''


                    debit_amt = 0.0
                    if debit_col:
                        debit_str = str(debit_col).strip().replace(',', '')
                        if debit_str:
                            try:
                                debit_amt = float(debit_str)
                            except:
                                pass


                    credit_amt = 0.0
                    if credit_col:
                        credit_str = str(credit_col).strip().replace(',', '')
                        if credit_str:
                            try:
                                credit_amt = float(credit_str)
                            except:
                                pass


                    balance_amt = 0.0
                    if balance_col:
                        balance_str = str(balance_col).strip().replace(',', '')
                        if balance_str:
                            try:

                                if balance_str.startswith('(') and balance_str.endswith(')'):
                                    balance_amt = -float(balance_str[1:-1])
                                elif balance_str.endswith('-'):
                                    balance_amt = -float(balance_str[:-1])
                                else:
                                    balance_amt = float(balance_str)
                            except:
                                pass


                    if particulars and (debit_amt > 0 or credit_amt > 0):
                        all_transactions.append({
                            'date': date_str,
                            'date_obj': date_obj,
                            'month_key': month_key,
                            'particulars': particulars,
                            'debit': debit_amt,
                            'credit': credit_amt,
                            'balance': balance_amt
                        })


                    if balance_amt != 0:
                        monthly_data[month_key]['balances'].append({
                            'date': date_obj,
                            'balance': balance_amt
                        })


                    is_salary = '/SALARY' in particulars or ('SALARY' in particulars and 'ACCOUNT' not in particulars)


                    is_emi = False
                    is_credit_card = False


                    if '_EMI_' in particulars or ('EMI' in particulars and ('PPR' in particulars or 'ACH' in particulars)):
                        is_emi = True


                    if 'ACH' in particulars and 'PERSONAL' in particulars.upper() and 'LOAN' in particulars.upper():
                        is_emi = True
                        active_loans.add('PERSONAL_LOAN')


                    nbfc_keywords = ['TATACAPITAL', 'TATA CAPITAL', 'BAJAJ', 'HDFC', 'ICICI',
                                    'AXIS', 'KOTAK', 'INDUSIND', 'YES BANK', 'IDFC', 'BANDHAN',
                                    'CAPITAL FIRST', 'FULLERTON', 'MUTHOOT', 'MANAPPURAM', 'L&T FINANCE']

                    is_insurance = any(ins_kw in particulars for ins_kw in ['INSURANCE', 'LIC', 'LIFE'])
                    if any(nbfc in particulars for nbfc in nbfc_keywords) and 'ACH' in particulars and not is_insurance:
                        is_emi = True


                    cc_keywords = ['CREDIT CARD', 'CC BILL', 'CC PAYMENT', 'CRED/', 'CREDCLUB',
                                  'CARD PAYMENT', 'CARD BILL', 'SBI CARD', 'HDFC CARD', 'ICICI CARD',
                                  'AXIS CARD', 'KOTAK CARD', 'AMEX', 'AMERICAN EXPRESS']
                    if any(cc in particulars for cc in cc_keywords):
                        is_credit_card = True


                    if 'PPR' in particulars and '_EMI_' in particulars:
                        active_loans.add('PERSONAL_LOAN')
                    if 'TATACAPITAL' in particulars or 'TATA CAPITAL' in particulars:
                        active_loans.add('TATA_CAPITAL_LOAN')
                    if 'HOME LOAN' in particulars or 'HOUSING' in particulars:
                        active_loans.add('HOME_LOAN')
                    if 'CAR LOAN' in particulars or 'VEHICLE' in particulars:
                        active_loans.add('VEHICLE_LOAN')
                    if any(nbfc in particulars for nbfc in ['BAJAJ', 'HDFC', 'ICICI', 'AXIS', 'KOTAK']) and 'ACH' in particulars and not is_insurance:
                        for nbfc in ['BAJAJ', 'HDFC', 'ICICI', 'AXIS', 'KOTAK']:
                            if nbfc in particulars:
                                active_loans.add(f'{nbfc}_LOAN')
                                break
                    if is_credit_card:
                        active_loans.add('CREDIT_CARD')


                    is_atm = any(kw in particulars for kw in ['ATM', 'CASH WDL', 'CASH WITHDRAWAL', 'ATM-CASH', 'ATW'])


                    bounce_keywords = ['BOUNCE', 'INWARD RETURN', 'DISHONOUR', 'DISHONOR',
                                       'CHQ RETURN', 'CHEQUE RETURN', 'ECS RETURN', 'NACH RETURN', 'UNPAID']
                    is_bounce = any(kw in particulars for kw in bounce_keywords)

                    if 'P2A' in particulars or 'P2M' in particulars or 'P2P' in particulars:
                        is_bounce = False


                    gambling_keywords = ['DREAM11', 'RUMMY', 'MPL', 'MOBILE PREMIER LEAGUE', 'POKERBAAZI',
                                        'ADDA52', 'JUNGLEE RUMMY', 'MY11CIRCLE', 'WINZO', 'GAMEZY',
                                        'PAYTM FIRST GAMES', 'FANTASY', 'BETTING', 'CASINO', 'POKER']
                    is_gambling = any(kw in particulars for kw in gambling_keywords)


                    if credit_amt > 0:
                        monthly_data[month_key]['credits'].append(credit_amt)
                        if is_salary:
                            monthly_data[month_key]['salary_transactions'].append(credit_amt)
                            monthly_data[month_key]['salary_dates'].append(date_obj)


                    if debit_amt > 0:
                        monthly_data[month_key]['debits'].append(debit_amt)
                        if is_emi:
                            monthly_data[month_key]['emi_transactions'].append(debit_amt)
                        if is_credit_card:
                            monthly_data[month_key]['credit_card_payments'].append(debit_amt)
                        if is_atm:
                            monthly_data[month_key]['atm_withdrawals'].append(debit_amt)
                        if is_bounce:
                            monthly_data[month_key]['bounce_charges'].append(debit_amt)
                        if is_gambling:
                            monthly_data[month_key]['gambling_transactions'].append(debit_amt)

                except Exception:
                    continue


        bank_data = {
            'account_number': account_number,
            'pan_number': pan_number,
            'high_value_credit_count': 0,
            'high_value_debit_count': 0,
            'average_monthly_credit': 0.0,
            'average_monthly_debit': 0.0,
            'income_stability': None,
            'average_obligation_to_income_ratio': 0.0,

            'total_bounce_charges': 0.0,
            'bounce_count': 0,
            'total_gambling_amount': 0.0,
            'gambling_transaction_count': 0,
            'credit_exposure_intensity': len(active_loans),
            'active_loans': list(active_loans),
            'average_cash_dependency': 0.0,
            'fifteen_day_stability': None
        }


        sorted_months = sorted(monthly_data.keys(), key=lambda x: (
            int(x.split('-')[1]),
            ['January', 'February', 'March', 'April', 'May', 'June',
             'July', 'August', 'September', 'October', 'November', 'December'].index(x.split('-')[0])
        ))


        months_to_process = sorted_months[:3]

        total_credits = 0
        total_debits = 0
        salaries = []
        emis = []
        months_processed = []
        high_value_threshold = 50000


        total_atm_withdrawals = 0
        total_bounce_charges = 0
        total_bounce_count = 0
        total_gambling = 0
        total_gambling_count = 0
        fifteen_day_stability_results = []

        for month_key in months_to_process:
            credits = monthly_data[month_key]['credits']
            debits = monthly_data[month_key]['debits']
            salary_txns = monthly_data[month_key]['salary_transactions']
            emi_txns = monthly_data[month_key]['emi_transactions']
            cc_txns = monthly_data[month_key]['credit_card_payments']
            atm_txns = monthly_data[month_key]['atm_withdrawals']
            bounce_txns = monthly_data[month_key]['bounce_charges']
            gambling_txns = monthly_data[month_key]['gambling_transactions']
            balances = monthly_data[month_key]['balances']
            salary_dates = monthly_data[month_key]['salary_dates']

            monthly_credit = sum(credits)
            monthly_debit = sum(debits)


            month_salary = salary_txns[0] if salary_txns else None


            month_emi = sum(emi_txns) if emi_txns else None


            for c in credits:
                if c > high_value_threshold:
                    bank_data['high_value_credit_count'] += 1
            for d in debits:
                if d > high_value_threshold:
                    bank_data['high_value_debit_count'] += 1


            month_end_balance = None
            if balances:
                sorted_balances = sorted(balances, key=lambda x: x['date'])
                month_end_balance = sorted_balances[-1]['balance']


            fifteen_day_stable = None
            if salary_dates and month_salary:
                salary_date = salary_dates[0]
                end_date = salary_date + timedelta(days=15)


                post_salary_debits = []
                for txn in all_transactions:
                    if txn['month_key'] == month_key and txn['debit'] > 0:
                        if salary_date <= txn['date_obj'] <= end_date:
                            post_salary_debits.append(txn['debit'])

                total_15day_spending = sum(post_salary_debits)

                if month_salary > 0:
                    spending_ratio = total_15day_spending / month_salary
                    fifteen_day_stable = spending_ratio < 0.5
                    fifteen_day_stability_results.append(fifteen_day_stable)


            month_atm = sum(atm_txns) if atm_txns else 0
            total_atm_withdrawals += month_atm


            month_bounce = sum(bounce_txns) if bounce_txns else 0
            month_bounce_count = len(bounce_txns)
            total_bounce_charges += month_bounce
            total_bounce_count += month_bounce_count


            month_gambling = sum(gambling_txns) if gambling_txns else 0
            month_gambling_count = len(gambling_txns)
            total_gambling += month_gambling
            total_gambling_count += month_gambling_count


            month_cc_payment = sum(cc_txns) if cc_txns else 0

            usable_salary = None
            eligible_emi = None
            total_obligation = month_emi if month_emi else 0

            if month_salary:
                usable_salary = round(month_salary - total_obligation, 2)
                eligible_emi = round(usable_salary * 0.6, 2)


            cash_dependency = None
            if month_salary and month_salary > 0:
                cash_dependency = round((month_atm / month_salary) * 100, 2)

            bank_data[month_key] = {
                'salary': month_salary,
                'total_emi': month_emi,
                'credit_card_payments': month_cc_payment,
                'monthly_credit': round(monthly_credit, 2),
                'monthly_debit': round(monthly_debit, 2),
                'credit_transaction_count': len(credits),
                'debit_transaction_count': len(debits),
                'avg_credit_transaction': round(monthly_credit / len(credits), 2) if credits else 0.0,
                'avg_debit_transaction': round(monthly_debit / len(debits), 2) if debits else 0.0,

                'month_end_balance': month_end_balance,
                'atm_withdrawals': month_atm,
                'bounce_charges': month_bounce,
                'bounce_count': month_bounce_count,
                'gambling_amount': month_gambling,
                'gambling_count': month_gambling_count,
                'fifteen_day_stability': fifteen_day_stable,
                'usable_salary': usable_salary,
                'eligible_emi': eligible_emi,
                'cash_dependency_ratio': cash_dependency
            }

            total_credits += monthly_credit
            total_debits += monthly_debit

            if month_salary:
                salaries.append(month_salary)
            if month_emi:
                emis.append(month_emi)

            months_processed.append(month_key)


        num_months = len(months_processed)
        if num_months > 0:
            bank_data['average_monthly_credit'] = round(total_credits / num_months, 2)
            bank_data['average_monthly_debit'] = round(total_debits / num_months, 2)


        if len(salaries) >= 2:
            avg_salary = sum(salaries) / len(salaries)
            variance = max(salaries) - min(salaries)
            variance_pct = (variance / avg_salary) * 100 if avg_salary > 0 else 0
            bank_data['income_stability'] = 'STABLE' if variance_pct < 5 else 'UNSTABLE'
        else:
            bank_data['income_stability'] = 'INSUFFICIENT_DATA'


        if salaries and emis:
            avg_salary = sum(salaries) / len(salaries)
            avg_emi = sum(emis) / len(emis)
            bank_data['average_obligation_to_income_ratio'] = round((avg_emi / avg_salary) * 100, 2) if avg_salary > 0 else 0.0


        bank_data['total_bounce_charges'] = total_bounce_charges
        bank_data['bounce_count'] = total_bounce_count
        bank_data['total_gambling_amount'] = total_gambling
        bank_data['gambling_transaction_count'] = total_gambling_count


        if salaries:
            avg_salary = sum(salaries) / len(salaries)
            if avg_salary > 0:
                bank_data['average_cash_dependency'] = round((total_atm_withdrawals / num_months / avg_salary) * 100, 2)


        if fifteen_day_stability_results:
            stable_count = sum(1 for x in fifteen_day_stability_results if x)
            bank_data['fifteen_day_stability'] = stable_count >= len(fifteen_day_stability_results) / 2


        if salaries and emis:
            avg_salary = sum(salaries) / len(salaries)
            avg_emi = sum(emis) / len(emis)
            avg_usable_salary = avg_salary - avg_emi
            bank_data['average_usable_salary'] = round(avg_usable_salary, 2)
            bank_data['average_eligible_emi'] = round(avg_usable_salary * 0.6, 2)
        elif salaries:
            avg_salary = sum(salaries) / len(salaries)
            bank_data['average_usable_salary'] = round(avg_salary, 2)
            bank_data['average_eligible_emi'] = round(avg_salary * 0.6, 2)


        recurring_transactions = self._detect_recurring_transactions(all_transactions, months_to_process)
        bank_data['recurring_transactions'] = recurring_transactions

        return bank_data

    def _normalize_transaction_description(self, particulars):
        """Normalize transaction description for grouping similar transactions"""

        normalized = particulars.upper()

        if '/SALARY' in normalized or 'BANK/SALARY' in normalized:
            return 'SALARY'


        if 'PPR' in normalized and '_EMI_' in normalized:
            return 'PERSONAL_LOAN_EMI'


        if 'ACH-DR' in normalized and 'TATACAPITAL' in normalized:
            return 'TATA_CAPITAL_LOAN'


        if normalized.startswith('APY/') or 'APY/' in normalized:
            return 'APY_PENSION'


        if 'ECS TXN CHRGS' in normalized or 'ECS TXNCHRGS' in normalized:
            return 'ECS_CHARGES'


        if 'SMS ALERT' in normalized:
            return 'SMS_CHARGES'


        if 'SIP-ZERODHA' in normalized or 'SIP/ZERODHA' in normalized or 'ZERODHA BROKING' in normalized:
            return 'SIP_ZERODHA'


        if 'LANDLORD' in normalized or '/RENT' in normalized:
            return 'RENT'


        if 'CRED/CC' in normalized or 'CC BILL' in normalized or 'CREDIT CARD' in normalized or 'CREDCLUB' in normalized:
            return 'CREDIT_CARD_PAYMENT'


        if 'SBI CARDS' in normalized:
            return 'SBI_CARD_PAYMENT'


        if 'UBER' in normalized:
            return 'UBER'


        if 'NETFLIX' in normalized:
            return 'NETFLIX_SUBSCRIPTION'


        if 'SPOTIFY' in normalized:
            return 'SPOTIFY_SUBSCRIPTION'


        if 'GOOGLE' in normalized and ('STORAGE' in normalized or 'DIGITAL' in normalized):
            return 'GOOGLE_SERVICES'


        if 'BLINKIT' in normalized:
            return 'BLINKIT_GROCERY'


        if 'SWIGGY' in normalized:
            return 'SWIGGY'


        if 'ZOMATO' in normalized:
            return 'ZOMATO'


        if 'AIRTEL/BROADBAND' in normalized or 'BROADBAND' in normalized:
            return 'BROADBAND'


        if 'CULT FIT' in normalized or 'CULTFIT' in normalized or 'GYM' in normalized:
            return 'GYM_SUBSCRIPTION'


        if 'INSURANCE' in normalized or 'LIC' in normalized or 'TATA AIG' in normalized or 'HDFC LIFE' in normalized:
            return 'INSURANCE'


        if 'PETROL' in normalized or 'FUEL' in normalized or 'SHELL' in normalized or 'HPCL' in normalized:
            return 'FUEL'


        if 'TATA PLAY' in normalized:
            return 'TATA_PLAY_DTH'


        if 'EURONET' in normalized:
            return 'EURONET_SERVICES'


        if 'PHARM' in normalized or 'MEDICAL' in normalized or 'MEDS' in normalized:
            return 'PHARMACY'


        if 'ATM' in normalized or 'CASH WDL' in normalized:
            return 'ATM_WITHDRAWAL'


        if 'BOUNCE' in normalized or 'RETURN' in normalized and 'INWARD' in normalized:
            return 'BOUNCE_CHARGE'


        if any(kw in normalized for kw in ['DREAM11', 'RUMMY', 'MPL', 'POKERBAAZI', 'WINZO']):
            return 'GAMBLING_BETTING'


        return normalized[:30]

    def _detect_recurring_transactions(self, all_transactions, months_to_process):
        """Detect transactions that occur in multiple months"""

        transaction_groups = defaultdict(list)

        for txn in all_transactions:
            if txn['month_key'] not in months_to_process:
                continue

            normalized = self._normalize_transaction_description(txn['particulars'])
            transaction_groups[normalized].append(txn)


        recurring = []

        for category, transactions in transaction_groups.items():

            months_found = set(txn['month_key'] for txn in transactions)


            if len(months_found) >= 2:
                amounts = []
                for txn in transactions:
                    if txn['debit'] > 0:
                        amounts.append(txn['debit'])
                    elif txn['credit'] > 0:
                        amounts.append(txn['credit'])

                avg_amount = round(sum(amounts) / len(amounts), 2) if amounts else 0


                txn_type = 'debit' if transactions[0]['debit'] > 0 else 'credit'

                recurring.append({
                    'category': category,
                    'frequency': len(transactions),
                    'months_found': sorted(list(months_found)),
                    'average_amount': avg_amount,
                    'transaction_type': txn_type
                })


        recurring.sort(key=lambda x: (-x['frequency'], x['category']))

        return recurring



    def extract_aadhaar_name(self, text_lines):
        """Extract name from Aadhaar card"""
        for line in text_lines:

            if re.match(r'^[A-Za-z]+\s+[A-Za-z]+\s+[A-Za-z]+$', line.strip()):
                words = line.strip().split()
                if (all(len(word) >= 3 for word in words) and
                    not any(gov_word in line.upper() for gov_word in
                           ['GOVERNMENT', 'INDIA', 'AUTHORITY', 'UNIQUE', 'UIDAI'])):
                    return line.strip().title()


        for line in text_lines:
            if (re.match(r'^[A-Za-z\s]{10,50}$', line.strip()) and
                len(line.strip().split()) >= 2):
                words = line.strip().split()
                if not any(gov_word in line.upper() for gov_word in
                          ['GOVERNMENT', 'INDIA', 'AUTHORITY', 'UNIQUE', 'UIDAI']):
                    return line.strip().title()

        return None

    def extract_aadhaar_number(self, text_lines):
        """Extract Aadhaar number (12 digits in groups of 4)"""
        for line in text_lines:
            match = re.search(r'(\d{4}\s+\d{4}\s+\d{4})', line)
            if match:
                return match.group(1)
        return None

    def extract_date_of_birth(self, text_lines):
        """Extract date of birth in DD/MM/YYYY format"""
        for line in text_lines:
            match = re.search(r'(\d{2}/\d{2}/\d{4})', line)
            if match:
                return match.group(1)
        return None

    def extract_gender(self, text_lines):
        """Extract gender from Aadhaar"""
        for line in text_lines:
            line_upper = line.upper()
            if re.search(r'\b(MALE|पुरुष)\b', line_upper):
                return 'MALE'
            elif re.search(r'\b(FEMALE|महिला)\b', line_upper):
                return 'FEMALE'
        return None

    def extract_mobile_number(self, text_lines):
        """Extract mobile number (Indian format)"""
        for line in text_lines:
            match = re.search(r'\b([6-9]\d{9})\b', line)
            if match:
                return match.group(1)
        return None

    def extract_aadhaar_address(self, text_lines):
        """Extract address from Aadhaar back - clean and formatted"""
        skip_keywords = [
            'unique', 'identification', 'authority', 'india', 'uidai',
            'government', 'enrolment', 'signature', 'valid', 'help@',
            'www.', 'aadhaar', 'vid', '.gov', '.in', '1947', 'download'
        ]

        address_start_idx = -1
        address_end_idx = -1
        so_name = None
        so_type = None


        for idx, line in enumerate(text_lines):
            line_upper = line.upper()
            line_clean = line.strip().rstrip('.,;:')

            if address_start_idx == -1:

                so_match = re.search(r'\b([SDCW])\s*/\s*O\b|\b(SIO|DIO|CIO|WIO)\.?\b', line_upper)
                if so_match:
                    address_start_idx = idx

                    if so_match.group(1):
                        so_type = so_match.group(1) + '/O'
                    elif so_match.group(2):
                        type_map = {'SIO': 'S/O', 'DIO': 'D/O', 'CIO': 'C/O', 'WIO': 'W/O'}
                        so_type = type_map.get(so_match.group(2), 'S/O')


                    so_name_match = re.search(r'(?:[SDCW]\s*/\s*O|SIO|DIO|CIO|WIO)\.?\s*[:\s,]*([A-Za-z]+(?:\s+[A-Za-z]+)?)', line, re.IGNORECASE)
                    if so_name_match:
                        so_name = so_name_match.group(1).strip().title()
                    else:

                        if idx + 1 < len(text_lines):
                            next_line = text_lines[idx + 1].strip()

                            if re.match(r'^[A-Za-z]+(?:\s+[A-Za-z]+)*$', next_line):
                                so_name = next_line.title()

                elif re.search(r'\bADDRESS\b', line_upper):
                    address_start_idx = idx + 1


            if address_start_idx != -1 and address_end_idx == -1:
                if re.search(r'\b\d{6}\b', line):
                    address_end_idx = idx
                    break


        if address_start_idx == -1:
            for idx, line in enumerate(text_lines):
                if re.search(r'\d{6}', line):
                    address_start_idx = max(0, idx - 5)
                    address_end_idx = idx
                    break


        if so_name:
            self.aadhaar_father_name = so_name

        if address_start_idx != -1:
            if address_end_idx == -1:
                address_end_idx = min(len(text_lines) - 1, address_start_idx + 8)


            raw_text = []
            pincode = None
            state = None
            district = None
            po_value = None
            so_prefix = so_type
            so_full_name = so_name


            indian_states = [
                'andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh',
                'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka',
                'kerala', 'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram',
                'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu',
                'telangana', 'tripura', 'uttar pradesh', 'uttarakhand', 'west bengal',
                'delhi', 'jammu and kashmir', 'ladakh', 'chandigarh', 'puducherry'
            ]

            for idx in range(address_start_idx, address_end_idx + 1):
                line = text_lines[idx].strip()
                if len(line) < 2:
                    continue


                should_skip = any(keyword in line.lower() for keyword in skip_keywords)
                if re.match(r'^\d{4}\s+\d{4}\s+\d{4}$', line):
                    continue

                has_pincode = bool(re.search(r'\b\d{6}\b', line))
                if should_skip and not has_pincode:
                    continue


                if has_pincode and should_skip:
                    pincode_only = re.search(r'\b(\d{6})\b', line)
                    if pincode_only:
                        raw_text.append(pincode_only.group(1))
                    continue

                raw_text.append(line)


            full_text = ' '.join(raw_text)

            full_text = full_text.replace(';', ',')


            pincode_match = re.search(r'\b(\d{6})\b', full_text)
            if pincode_match:
                pincode = pincode_match.group(1)
                full_text = re.sub(r'\b\d{6}\b', '', full_text)


            for st in indian_states:
                if st in full_text.lower():
                    state = st.title()
                    full_text = re.sub(re.escape(st), '', full_text, flags=re.IGNORECASE)
                    break


            dist_match = re.search(r'(?:DIST|DT|District)\s*[:\.]?\s*([A-Za-z]+)', full_text, re.IGNORECASE)
            if dist_match:
                district = dist_match.group(1).strip().title()
                full_text = re.sub(r'(?:DIST|DT|District)\s*[:\.]?\s*[A-Za-z]+', '', full_text, flags=re.IGNORECASE)


            po_match = re.search(r'\bPO\s*[:\.]?\s*([A-Za-z]+)', full_text, re.IGNORECASE)
            if po_match:
                po_value = po_match.group(1).strip().title()
                full_text = re.sub(r'\bPO\s*[:\.]?\s*[A-Za-z]+', '', full_text, flags=re.IGNORECASE)


            so_match = re.search(r'\b([SDCW])\s*/\s*O\s*[:\s,]*([A-Za-z]+(?:\s+[A-Za-z]+)*)', full_text, re.IGNORECASE)
            if not so_match:
                so_match = re.search(r'\b(S|D|C|W)IO\s*[:\s,]*([A-Za-z]+(?:\s+[A-Za-z]+)*)', full_text, re.IGNORECASE)
            if so_match:
                so_prefix = so_match.group(1).upper()
                so_full_name = so_match.group(2).strip().title()

                if so_full_name:
                    self.aadhaar_father_name = so_full_name

                full_text = re.sub(r'\b[SDCW]\s*/\s*O\s*[:\s,]*[A-Za-z]+(?:\s+[A-Za-z]+)*', '', full_text, flags=re.IGNORECASE)
                full_text = re.sub(r'\b[SDCW]IO\s*[:\s,]*[A-Za-z]+(?:\s+[A-Za-z]+)*', '', full_text, flags=re.IGNORECASE)


            full_text = re.sub(r'[#\-:]+', ' ', full_text)


            parts = re.split(r'[,\s]+', full_text)


            seen = set()
            unique_parts = []
            for part in parts:
                part = part.strip(' ,.:')
                part_lower = part.lower()

                if len(part) <= 1 or part_lower in seen:
                    continue

                if part_lower in ['po', 'dist', 'dt', 'p.o', 'p.o.', 'sio', 's/o', 'd/o', 'c/o', 'w/o']:
                    continue

                if so_full_name and part_lower in so_full_name.lower().split():
                    continue
                seen.add(part_lower)
                unique_parts.append(part)


            final_parts = []


            if so_prefix and so_full_name:
                if '/' in so_prefix:
                    final_parts.append(f"{so_prefix} {so_full_name}")
                else:
                    final_parts.append(f"{so_prefix}/O {so_full_name}")


            for part in unique_parts:
                final_parts.append(part)


            if po_value and po_value.lower() not in seen:
                final_parts.append(f"PO: {po_value}")


            if district and district.lower() not in seen:
                final_parts.append(f"Dist: {district}")


            if state and state.lower() not in seen:
                final_parts.append(state)


            if pincode:
                final_parts.append(pincode)

            if final_parts:
                full_address = ', '.join(final_parts)

                full_address = re.sub(r'\s+', ' ', full_address)
                full_address = re.sub(r',\s*,', ',', full_address)
                full_address = full_address.strip(', ')
                return full_address

        return None



    def extract_pan_name_with_reference(self, text_lines, aadhaar_name):
        """Extract name from PAN card, cross-reference with Aadhaar"""
        pan_name = None


        for i, line in enumerate(text_lines):
            if re.search(r'(name|नाम)', line, re.IGNORECASE):
                name_match = re.search(r'(?:name|नाम)[:\s/]*([A-Za-z\s]+)', line, re.IGNORECASE)
                if name_match:
                    candidate = name_match.group(1).strip()
                    if len(candidate) > 5:
                        pan_name = candidate.title()
                        break


                if i + 1 < len(text_lines):
                    next_line = text_lines[i + 1].strip()
                    if len(next_line) > 5 and re.match(r'^[A-Za-z\s]+$', next_line):
                        pan_name = next_line.title()
                        break


        if not pan_name and aadhaar_name:
            aadhaar_words = aadhaar_name.lower().split()
            for line in text_lines:
                line_lower = line.lower()
                if all(word in line_lower for word in aadhaar_words):
                    cleaned_line = re.sub(r'[^\w\s]', ' ', line)
                    cleaned_line = re.sub(r'\s+', ' ', cleaned_line).strip()
                    if len(cleaned_line.split()) >= 3:
                        pan_name = cleaned_line.title()
                        break

        if not pan_name and aadhaar_name:
            pan_name = aadhaar_name


        return pan_name

    def extract_pan_father_name_with_reference(self, text_lines, aadhaar_name):
        """Extract father's name from PAN card - prioritize S/O from Aadhaar back"""
        father_name = None


        if self.aadhaar_father_name:
            father_name = self.aadhaar_father_name

            if aadhaar_name:
                aadhaar_parts = aadhaar_name.split()
                if len(aadhaar_parts) >= 2:
                    last_name = aadhaar_parts[-1]

                    if last_name.lower() not in father_name.lower():
                        father_name = f"{father_name} {last_name}"
            return father_name


        for i, line in enumerate(text_lines):
            if re.search(r'(father|पिता)', line, re.IGNORECASE):
                father_match = re.search(r'(?:father|पिता)(?:\'?s)?\s*(?:name)?\s*[:\s/]*([A-Za-z\s]+)',
                                        line, re.IGNORECASE)
                if father_match:
                    candidate = father_match.group(1).strip()
                    if len(candidate) > 3:
                        father_name = candidate.title()
                        break

                if i + 1 < len(text_lines):
                    next_line = text_lines[i + 1].strip()
                    if len(next_line) > 3 and re.match(r'^[A-Za-z\s]+$', next_line):
                        father_name = next_line.title()
                        break


        if not father_name and aadhaar_name:
            aadhaar_parts = aadhaar_name.split()
            if len(aadhaar_parts) >= 3:
                father_name = f"{aadhaar_parts[1]} {aadhaar_parts[-1]}"
            elif len(aadhaar_parts) == 2:
                father_name = None

        return father_name

    def extract_pan_number(self, text_lines):
        """Extract PAN number (AAAAA9999A format)"""
        for line in text_lines:
            match = re.search(r'\b([A-Z]{5}\d{4}[A-Z])\b', line.upper())
            if match:
                return match.group(1)
        return None



    def process_aadhaar_front(self):
        """Process Aadhaar front image"""
        if not self.document_files['aadhaar_front']:
            return {}


        text_lines = self.extract_text_lines(self.document_files['aadhaar_front'], try_both_resolutions=True)
        return {
            'name': self.extract_aadhaar_name(text_lines),
            'aadhaar_number': self.extract_aadhaar_number(text_lines),
            'date_of_birth': self.extract_date_of_birth(text_lines),
            'gender': self.extract_gender(text_lines),
            'mobile_number': self.extract_mobile_number(text_lines)
        }

    def process_aadhaar_back(self):
        """Process Aadhaar back image"""
        if not self.document_files['aadhaar_back']:
            return {}

        text_lines = self.extract_text_lines(self.document_files['aadhaar_back'])
        return {
            'address': self.extract_aadhaar_address(text_lines),
            'aadhaar_number_back': self.extract_aadhaar_number(text_lines)
        }

    def process_pan_card(self, aadhaar_name=None):
        """Process PAN card image"""
        if not self.document_files['pan']:
            return {}

        text_lines = self.extract_text_lines(self.document_files['pan'])
        return {
            'name': self.extract_pan_name_with_reference(text_lines, aadhaar_name),
            'father_name': self.extract_pan_father_name_with_reference(text_lines, aadhaar_name),
            'pan_number': self.extract_pan_number(text_lines),
            'date_of_birth': self.extract_date_of_birth(text_lines)
        }

    def calculate_employment_tenure(self, payslip_data):
        """Calculate employment tenure from payslip date of joining - NEW"""
        employment_tenure_years = None
        date_of_joining = None
        job_stability = None


        for month, data in payslip_data.items():
            if data.get('date_of_joining'):
                date_of_joining = data['date_of_joining']
                break

        if date_of_joining:
            try:

                date_formats = [
                    '%d %b %Y',
                    '%d %B %Y',
                    '%d-%b-%Y',
                    '%d/%b/%Y',
                    '%d/%m/%Y',
                    '%d-%m-%Y',
                    '%Y-%m-%d',
                    '%d/%m/%y',
                    '%d-%m-%y'
                ]

                for fmt in date_formats:
                    try:
                        doj = datetime.strptime(date_of_joining, fmt)
                        today = datetime.now()
                        tenure_days = (today - doj).days
                        employment_tenure_years = round(tenure_days / 365.25, 2)


                        if employment_tenure_years >= 3:
                            job_stability = "Stable (>=3 years)"
                        else:
                            job_stability = "Unstable (<3 years)"
                        break
                    except ValueError:
                        continue
            except Exception as e:
                pass

        return {
            'date_of_joining': date_of_joining if date_of_joining else None,
            'employment_tenure_years': employment_tenure_years if employment_tenure_years else None,
            'job_stability': job_stability if job_stability else None
        }

    def calculate_credit_score_metrics(self, bank_data, payslip_data):
        """Calculate additional credit score metrics - NEW"""
        metrics = {
            'average_deduction_to_gross_ratio': None,
            'average_provident_fund': None,
            'total_provident_fund': None,
            'employer_name': None,
            'employer_category': None
        }


        deduction_ratios = []
        pf_amounts = []

        for month, data in payslip_data.items():
            if data.get('deduction_to_gross_ratio'):
                deduction_ratios.append(data['deduction_to_gross_ratio'])
            if data.get('provident_fund'):
                pf_amounts.append(data['provident_fund'])

            if not metrics['employer_name'] and data.get('employer_name'):
                metrics['employer_name'] = data['employer_name']
                metrics['employer_category'] = data.get('employer_category')

        if deduction_ratios:
            metrics['average_deduction_to_gross_ratio'] = round(sum(deduction_ratios) / len(deduction_ratios), 2)

        if pf_amounts:
            metrics['average_provident_fund'] = round(sum(pf_amounts) / len(pf_amounts), 2)
            metrics['total_provident_fund'] = sum(pf_amounts)

        return metrics

    def verify_data(self, aadhaar_front, aadhaar_back, pan_data, bank_data, payslip_data):
        """Cross-verify extracted data across documents"""


        aadhaar_match = None
        if aadhaar_front.get('aadhaar_number') and aadhaar_back.get('aadhaar_number_back'):
            aadhaar_match = aadhaar_front['aadhaar_number'] == aadhaar_back['aadhaar_number_back']


        name_match = None
        if aadhaar_front.get('name') and pan_data.get('name'):
            words1 = set(aadhaar_front['name'].lower().split())
            words2 = set(pan_data['name'].lower().split())
            name_match = len(words1.intersection(words2)) >= 2


        dob_match = None
        if aadhaar_front.get('date_of_birth') and pan_data.get('date_of_birth'):
            dob_match = aadhaar_front['date_of_birth'] == pan_data['date_of_birth']


        pan_bank_match = None
        if pan_data.get('pan_number') and bank_data.get('pan_number'):
            pan_bank_match = pan_data['pan_number'] == bank_data['pan_number']


        account_matches = {}
        for month, payslip_info in payslip_data.items():
            if payslip_info.get('bank_account_number') and bank_data.get('account_number'):
                account_matches[month] = payslip_info['bank_account_number'] == bank_data['account_number']

        return {
            'aadhaar_numbers_match': aadhaar_match,
            'names_match': name_match,
            'date_of_birth_match': dob_match,
            'pan_numbers_match': pan_bank_match,
            'bank_account_matches': account_matches
        }

    def _generate_unique_output_name(self, person_name=None):
        """Generate unique output filename based on person's name and timestamp"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

        if person_name:

            clean_name = re.sub(r'[^\w\s]', '', person_name)
            clean_name = clean_name.replace(' ', '_')

            name_parts = clean_name.split('_')
            if len(name_parts) >= 2:
                short_name = f"{name_parts[0]}_{name_parts[-1]}"
            else:
                short_name = clean_name

            base_name = f"{short_name}_{timestamp}"
        else:

            short_uuid = str(uuid.uuid4())[:8]
            base_name = f"document_{short_uuid}_{timestamp}"

        return base_name

    def save_results(self, aadhaar_front, aadhaar_back, pan_data, bank_data, payslip_data,
                     verification, employment_info, credit_metrics):
        """Save results with unique dynamic filenames"""


        person_name = aadhaar_front.get('name') or pan_data.get('name')
        base_name = self._generate_unique_output_name(person_name)


        output_json = self.output_dir / f"{base_name}.json"
        output_txt = self.output_dir / f"{base_name}.txt"

        output = {
            'aadhaar_card': {
                'front': aadhaar_front,
                'back': aadhaar_back
            },
            'pan_card': pan_data,
            'bank_statement': bank_data,
            'payslips': payslip_data,
            'employment_info': employment_info,
            'credit_score_metrics': credit_metrics,
            'verification': verification,
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'source_directory': str(self.images_dir)
        }


        with open(output_json, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)


        with open(output_txt, 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n")
            f.write("DOCUMENT OCR EXTRACTION RESULTS (CREDIT SCORE ENHANCED)\n")
            f.write("=" * 80 + "\n\n")
            f.write(f"Timestamp: {output['timestamp']}\n\n")

            f.write("-" * 80 + "\n")
            f.write("AADHAAR CARD INFORMATION\n")
            f.write("-" * 80 + "\n")
            f.write(f"Name: {aadhaar_front.get('name', 'Not Found')}\n")
            f.write(f"Aadhaar Number: {aadhaar_front.get('aadhaar_number', 'Not Found')}\n")
            f.write(f"Date of Birth: {aadhaar_front.get('date_of_birth', 'Not Found')}\n")
            f.write(f"Gender: {aadhaar_front.get('gender', 'Not Found')}\n")
            f.write(f"Mobile Number: {aadhaar_front.get('mobile_number', 'Not Found')}\n")
            f.write(f"Address: {aadhaar_back.get('address', 'Not Found')}\n\n")

            f.write("-" * 80 + "\n")
            f.write("PAN CARD INFORMATION\n")
            f.write("-" * 80 + "\n")
            f.write(f"Name: {pan_data.get('name', 'Not Found')}\n")
            f.write(f"Father's Name: {pan_data.get('father_name', 'Not Found')}\n")
            f.write(f"PAN Number: {pan_data.get('pan_number', 'Not Found')}\n")
            f.write(f"Date of Birth: {pan_data.get('date_of_birth', 'Not Found')}\n\n")


            f.write("-" * 80 + "\n")
            f.write("EMPLOYMENT INFORMATION\n")
            f.write("-" * 80 + "\n")
            f.write(f"Date of Joining: {employment_info.get('date_of_joining') or 'Not Found'}\n")
            f.write(f"Employment Tenure: {employment_info.get('employment_tenure_years') or 'Not Found'} years\n")
            f.write(f"Job Stability: {employment_info.get('job_stability') or 'Not Found'}\n\n")

            f.write("-" * 80 + "\n")
            f.write("BANK STATEMENT INFORMATION\n")
            f.write("-" * 80 + "\n")
            f.write(f"Account Number: {bank_data.get('account_number', 'Not Found')}\n")
            f.write(f"PAN Number: {bank_data.get('pan_number', 'Not Found')}\n\n")

            f.write("MONTHLY BREAKDOWN:\n\n")


            non_month_keys = ['account_number', 'pan_number', 'high_value_credit_count',
                             'high_value_debit_count', 'average_monthly_credit',
                             'average_monthly_debit', 'income_stability',
                             'average_obligation_to_income_ratio', 'total_bounce_charges',
                             'bounce_count', 'total_gambling_amount', 'gambling_transaction_count',
                             'credit_exposure_intensity', 'active_loans', 'average_cash_dependency',
                             'fifteen_day_stability', 'average_usable_salary', 'average_eligible_emi',
                             'recurring_transactions']

            month_keys = [k for k in bank_data.keys() if k not in non_month_keys]

            for month in sorted(month_keys):
                month_data = bank_data.get(month, {})

                if isinstance(month_data, dict):
                    f.write(f"  {month}:\n")
                    f.write(f"    Salary: ₹{month_data.get('salary', 'Not Found')}\n")
                    f.write(f"    Total EMI/Obligations: ₹{month_data.get('total_emi', 'Not Found')}\n")
                    f.write(f"    Credit Card Payments: ₹{month_data.get('credit_card_payments', 0)}\n")
                    f.write(f"    Monthly Credit: ₹{month_data.get('monthly_credit', 0.0):.2f}\n")
                    f.write(f"    Monthly Debit: ₹{month_data.get('monthly_debit', 0.0):.2f}\n")
                    f.write(f"    Month-End Balance: ₹{month_data.get('month_end_balance', 'Not Found')}\n")
                    f.write(f"    Credit Transaction Count: {month_data.get('credit_transaction_count', 0)}\n")
                    f.write(f"    Debit Transaction Count: {month_data.get('debit_transaction_count', 0)}\n")
                    f.write(f"    Avg Credit Transaction: ₹{month_data.get('avg_credit_transaction', 0.0):.2f}\n")
                    f.write(f"    Avg Debit Transaction: ₹{month_data.get('avg_debit_transaction', 0.0):.2f}\n")
                    f.write(f"    ATM Withdrawals: ₹{month_data.get('atm_withdrawals', 0)}\n")
                    f.write(f"    Bounce Charges: ₹{month_data.get('bounce_charges', 0)} (Count: {month_data.get('bounce_count', 0)})\n")
                    f.write(f"    Gambling Amount: ₹{month_data.get('gambling_amount', 0)} (Count: {month_data.get('gambling_count', 0)})\n")
                    f.write(f"    15-Day Stability: {month_data.get('fifteen_day_stability', 'N/A')}\n")
                    f.write(f"    Usable Salary: ₹{month_data.get('usable_salary', 'N/A')}\n")
                    f.write(f"    Eligible EMI (60%): ₹{month_data.get('eligible_emi', 'N/A')}\n")
                    f.write(f"    Cash Dependency Ratio: {month_data.get('cash_dependency_ratio', 'N/A')}%\n\n")

            f.write("OVERALL METRICS:\n")
            f.write(f"  High Value Credits (>50K): {bank_data.get('high_value_credit_count', 0)}\n")
            f.write(f"  High Value Debits (>50K): {bank_data.get('high_value_debit_count', 0)}\n")
            f.write(f"  Average Monthly Credit: ₹{bank_data.get('average_monthly_credit', 0.0):.2f}\n")
            f.write(f"  Average Monthly Debit: ₹{bank_data.get('average_monthly_debit', 0.0):.2f}\n")
            f.write(f"  Income Stability: {bank_data.get('income_stability', 'Not Found')}\n")
            f.write(f"  Average Obligation to Income Ratio: {bank_data.get('average_obligation_to_income_ratio', 0.0):.2f}%\n")
            f.write(f"  Average Usable Salary: ₹{bank_data.get('average_usable_salary', 'N/A')}\n")
            f.write(f"  Average Eligible EMI (60%): ₹{bank_data.get('average_eligible_emi', 'N/A')}\n\n")


            f.write("-" * 80 + "\n")
            f.write("CREDIT SCORE SPECIFIC METRICS\n")
            f.write("-" * 80 + "\n")
            f.write(f"Total Bounce Charges: ₹{bank_data.get('total_bounce_charges', 0)}\n")
            f.write(f"Bounce Count: {bank_data.get('bounce_count', 0)}\n")
            f.write(f"Total Gambling Amount: ₹{bank_data.get('total_gambling_amount', 0)}\n")
            f.write(f"Gambling Transaction Count: {bank_data.get('gambling_transaction_count', 0)}\n")
            f.write(f"Credit Exposure Intensity (Active Loans): {bank_data.get('credit_exposure_intensity', 0)}\n")
            f.write(f"Active Loans: {', '.join(bank_data.get('active_loans', [])) or 'None'}\n")
            f.write(f"Average Cash Dependency: {bank_data.get('average_cash_dependency', 0)}%\n")
            f.write(f"Overall 15-Day Stability: {bank_data.get('fifteen_day_stability', 'N/A')}\n\n")


            f.write("-" * 80 + "\n")
            f.write("PAYSLIP DERIVED METRICS\n")
            f.write("-" * 80 + "\n")
            f.write(f"Average Deduction to Gross Ratio: {credit_metrics.get('average_deduction_to_gross_ratio', 'N/A')}%\n")
            f.write(f"Average Provident Fund: ₹{credit_metrics.get('average_provident_fund', 'N/A')}\n")
            f.write(f"Total Provident Fund: ₹{credit_metrics.get('total_provident_fund', 'N/A')}\n\n")

            f.write("-" * 80 + "\n")
            f.write("PAYSLIP INFORMATION\n")
            f.write("-" * 80 + "\n")

            for month, payslip in payslip_data.items():
                f.write(f"{month}:\n")
                f.write(f"  Name: {payslip.get('name', 'Not Found')}\n")
                f.write(f"  Employer: {payslip.get('employer_name', 'Not Found')}\n")
                f.write(f"  Employer Category: {payslip.get('employer_category', 'Not Found')}\n")
                f.write(f"  Bank Account: {payslip.get('bank_account_number', 'Not Found')}\n")
                f.write(f"  Total Earnings (Gross): ₹{payslip.get('total_earnings', 'Not Found')}\n")
                f.write(f"  Total Deductions: ₹{payslip.get('total_deductions', 'Not Found')}\n")
                f.write(f"  Net Pay: ₹{payslip.get('net_pay', 'Not Found')}\n")
                f.write(f"  Provident Fund: ₹{payslip.get('provident_fund', 'Not Found')}\n")
                f.write(f"  Deduction to Gross Ratio: {payslip.get('deduction_to_gross_ratio', 'N/A')}%\n\n")

            f.write("-" * 80 + "\n")
            f.write("CROSS-VERIFICATION RESULTS\n")
            f.write("-" * 80 + "\n")
            f.write(f"Aadhaar Numbers Match: {verification.get('aadhaar_numbers_match', 'N/A')}\n")
            f.write(f"Names Match (Aadhaar-PAN): {verification.get('names_match', 'N/A')}\n")
            f.write(f"Date of Birth Match: {verification.get('date_of_birth_match', 'N/A')}\n")
            f.write(f"PAN Numbers Match (PAN-Bank): {verification.get('pan_numbers_match', 'N/A')}\n")

            f.write("\nBank Account Matches:\n")
            for month, match in verification.get('bank_account_matches', {}).items():
                f.write(f"  {month}: {match}\n")

            f.write("\n" + "=" * 80 + "\n")
            f.write("END OF REPORT\n")
            f.write("=" * 80 + "\n")

        print(f"\n Results saved to:")
        print(f"    {output_json}")
        print(f"    {output_txt}")

        final_json_path = self.generate_reduced_json(output, person_name)
        print(f"    {final_json_path}")

        return str(output_json), str(output_txt), str(final_json_path)

    def generate_reduced_json(self, full_output, person_name):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')

        if person_name:
            clean_name = re.sub(r'[^\w\s]', '', person_name)
            clean_name = clean_name.replace(' ', '_')
            name_parts = clean_name.split('_')
            if len(name_parts) >= 2:
                short_name = f"{name_parts[0]}_{name_parts[-1]}"
            else:
                short_name = clean_name
            final_name = f"Final_{short_name}_{timestamp}"
        else:
            short_uuid = str(uuid.uuid4())[:8]
            final_name = f"Final_{short_uuid}_{timestamp}"

        bank_data = full_output.get('bank_statement', {})
        employment_info = full_output.get('employment_info', {})
        credit_metrics = full_output.get('credit_score_metrics', {})

        month_keys = []
        non_month_keys = ['account_number', 'pan_number', 'high_value_credit_count',
                         'high_value_debit_count', 'average_monthly_credit',
                         'average_monthly_debit', 'income_stability',
                         'average_obligation_to_income_ratio', 'total_bounce_charges',
                         'bounce_count', 'total_gambling_amount', 'gambling_transaction_count',
                         'credit_exposure_intensity', 'active_loans', 'average_cash_dependency',
                         'fifteen_day_stability', 'average_usable_salary', 'average_eligible_emi',
                         'recurring_transactions']
        for k in bank_data.keys():
            if k not in non_month_keys and isinstance(bank_data.get(k), dict):
                month_keys.append(k)

        month_end_balances = []
        for month in month_keys:
            month_data = bank_data.get(month, {})
            if month_data.get('month_end_balance') is not None:
                month_end_balances.append(month_data['month_end_balance'])

        avg_month_end_balance = round(sum(month_end_balances) / len(month_end_balances), 2) if month_end_balances else 0.0

        reduced_output = {
            'income_profile': {
                'average_monthly_credit': bank_data.get('average_monthly_credit', 0.0),
                'income_stability': bank_data.get('income_stability'),
                'average_usable_salary': bank_data.get('average_usable_salary'),
                'average_eligible_emi': bank_data.get('average_eligible_emi')
            },
            'employment_profile': {
                'employment_tenure_years': employment_info.get('employment_tenure_years'),
                'employer_category': credit_metrics.get('employer_category')
            },
            'credit_exposure': {
                'average_obligation_to_income_ratio': bank_data.get('average_obligation_to_income_ratio', 0.0),
                'credit_exposure_intensity': bank_data.get('credit_exposure_intensity', 0),
                'active_loans': bank_data.get('active_loans', [])
            },
            'liquidity_behavior': {
                'average_month_end_balance': avg_month_end_balance
            },
            'behavioral_risk_flags': {
                'bounce_count': bank_data.get('bounce_count', 0),
                'gambling_transaction_count': bank_data.get('gambling_transaction_count', 0)
            }
        }

        output_path = self.output_dir / f"{final_name}.json"
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(reduced_output, f, indent=2, ensure_ascii=False)

        return output_path

    def run(self):
        """Main execution method"""
        print("=" * 50)
        print("Document Parser (Credit Score Enhanced Version)")
        print("=" * 50)

        if not self.check_files():
            return

        print("\n Processing Aadhaar Card (Front)...")
        aadhaar_front = self.process_aadhaar_front()
        print(f"   Name: {aadhaar_front.get('name', 'Not Found')}")
        print(f"   Aadhaar: {aadhaar_front.get('aadhaar_number', 'Not Found')}")

        print("\n Processing Aadhaar Card (Back)...")
        aadhaar_back = self.process_aadhaar_back()
        address = aadhaar_back.get('address', 'Not Found')
        print(f"   Address: {address[:50] if address else 'Not Found'}...")

        print("\n Processing PAN Card...")
        pan_data = self.process_pan_card(aadhaar_front.get('name'))
        print(f"   Name: {pan_data.get('name', 'Not Found')}")
        print(f"   PAN: {pan_data.get('pan_number', 'Not Found')}")

        print("\n Processing Bank Statement...")
        bank_data = self.parse_bank_statement()
        print(f"   Account: {bank_data.get('account_number', 'Not Found')}")


        non_month_keys = ['account_number', 'pan_number', 'high_value_credit_count',
                         'high_value_debit_count', 'average_monthly_credit',
                         'average_monthly_debit', 'income_stability',
                         'average_obligation_to_income_ratio', 'total_bounce_charges',
                         'bounce_count', 'total_gambling_amount', 'gambling_transaction_count',
                         'credit_exposure_intensity', 'active_loans', 'average_cash_dependency',
                         'fifteen_day_stability', 'average_usable_salary', 'average_eligible_emi',
                         'recurring_transactions']
        month_keys = [k for k in bank_data.keys() if k not in non_month_keys]

        for month in sorted(month_keys):
            month_data = bank_data.get(month, {})
            if isinstance(month_data, dict):
                print(f"   {month} Salary: ₹{month_data.get('salary', 'Not Found')}")
                print(f"   {month} Month-End Balance: ₹{month_data.get('month_end_balance', 'Not Found')}")

        print(f"   Income Stability: {bank_data.get('income_stability', 'Not Found')}")
        print(f"   Avg Obligation/Income Ratio: {bank_data.get('average_obligation_to_income_ratio', 0.0):.2f}%")


        print(f"\n    Credit Score Metrics:")
        print(f"   Bounce Charges: ₹{bank_data.get('total_bounce_charges', 0)} ({bank_data.get('bounce_count', 0)} occurrences)")
        print(f"   Gambling/Betting: ₹{bank_data.get('total_gambling_amount', 0)} ({bank_data.get('gambling_transaction_count', 0)} transactions)")
        print(f"   Active Loans/EMIs: {bank_data.get('credit_exposure_intensity', 0)}")
        print(f"   Cash Dependency: {bank_data.get('average_cash_dependency', 0):.2f}%")
        print(f"   15-Day Stability: {bank_data.get('fifteen_day_stability', 'N/A')}")
        print(f"   Avg Usable Salary: ₹{bank_data.get('average_usable_salary', 'N/A')}")
        print(f"   Avg Eligible EMI (60%): ₹{bank_data.get('average_eligible_emi', 'N/A')}")

        print("\n Processing Payslips...")
        payslip_data = self.process_all_payslips()
        for month in payslip_data:
            print(f"   {month}: ₹{payslip_data[month].get('net_pay', 'Not Found')}")
            if payslip_data[month].get('provident_fund'):
                print(f"      PF: ₹{payslip_data[month].get('provident_fund')}")
            if payslip_data[month].get('deduction_to_gross_ratio'):
                print(f"      Deduction/Gross: {payslip_data[month].get('deduction_to_gross_ratio')}%")


        print("\n Calculating Employment Tenure...")
        employment_info = self.calculate_employment_tenure(payslip_data)
        print(f"   Date of Joining: {employment_info.get('date_of_joining') or 'Not Found'}")
        print(f"   Tenure: {employment_info.get('employment_tenure_years') or 'N/A'} years")
        print(f"   Job Stability: {employment_info.get('job_stability') or 'N/A'}")


        print("\n Calculating Credit Score Metrics...")
        credit_metrics = self.calculate_credit_score_metrics(bank_data, payslip_data)
        print(f"   Avg Deduction/Gross Ratio: {credit_metrics.get('average_deduction_to_gross_ratio', 'N/A')}%")
        print(f"   Avg Provident Fund: ₹{credit_metrics.get('average_provident_fund', 'N/A')}")

        print("\n Cross-verifying documents...")
        verification = self.verify_data(aadhaar_front, aadhaar_back, pan_data, bank_data, payslip_data)

        print("\n Saving results...")
        self.save_results(aadhaar_front, aadhaar_back, pan_data, bank_data, payslip_data,
                         verification, employment_info, credit_metrics)

        print("\n" + "=" * 50)
        print(" Processing Complete!")
        print("=" * 50)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Document OCR Parser - Credit Score Enhanced')
    parser.add_argument('--input', '-i', default='images',
                        help='Input directory containing documents (default: images)')
    parser.add_argument('--output-dir', '-o', default='outputs',
                        help='Output directory for results (default: outputs)')
    parser.add_argument('--no-rename', action='store_true',
                        help='Disable automatic file renaming')

    args = parser.parse_args()

    ocr = DocumentOCR(
        images_dir=args.input,
        output_dir=args.output_dir,
        auto_rename=not args.no_rename
    )
    ocr.run()
