import pandas as pd

def generate_counterfactuals(raw_features, model_pipeline, training_cols):
    """
    Generates actionable paths to approval for a rejected applicant by simulating
    improvements across 3 smart tracks: Behavior, Debt, and Wealth.
    """
    def predict_score(features_dict):
        df = pd.DataFrame([features_dict])
        df = df[training_cols]
        return int(round(model_pipeline.predict(df)[0]))

    current_score = predict_score(raw_features)
    
    if current_score >= 650:
        return []

    paths = []

    # --- TRACK 1: Behavioral Focus ---
    t1 = raw_features.copy()
    if t1['bounce_count'] > 0 or t1['gambling_transaction_count'] > 0:
        t1['bounce_count'] = 0
        t1['gambling_transaction_count'] = 0
        
        # If behavior alone isn't enough, find the minimal salary/balance bump needed
        loops_t1 = 0
        while predict_score(t1) < 650 and loops_t1 < 25:
            loops_t1 += 1
            t1['average_usable_salary'] += 5000
            t1['average_month_end_balance'] += 3000  # FIX: Balance must grow with salary
            
        if predict_score(t1) >= 650:
            if loops_t1 == 0:
                paths.append("Behavioral Fix: Maintain a clean record. Having 0 bounced transactions and stopping gambling/betting transactions will instantly push your score into the approval range.")
            else:
                paths.append(f"Behavior & Income: Maintain 0 bounced/gambling transactions AND increase your usable salary by ₹{loops_t1 * 5000:,} (with a ₹{loops_t1 * 3000:,} higher month-end balance) to get approved.")

    # --- TRACK 2: Debt Restructuring ---
    t2 = raw_features.copy()
    has_debt = t2['active_loans_count'] > 0 or t2['has_personal_loan'] > 0 or t2['average_obligation_to_income_ratio'] > 0
    if has_debt:
        # Simulate clearing 1 loan and dropping FOIR
        t2['active_loans_count'] = max(0, t2['active_loans_count'] - 1)
        t2['has_personal_loan'] = 0
        t2['average_obligation_to_income_ratio'] = max(0, t2['average_obligation_to_income_ratio'] - 20.0)
        
        loops_t2 = 0
        while predict_score(t2) < 650 and loops_t2 < 25:
            loops_t2 += 1
            t2['average_usable_salary'] += 5000
            t2['average_month_end_balance'] += 3000
            
        if predict_score(t2) >= 650:
            if loops_t2 == 0:
                paths.append("Debt Restructuring: Foreclose 1 active loan (specifically personal loans) and lower your EMI obligation ratio by 20%. This alone will push your score into the approval range.")
            else:
                paths.append(f"Debt Restructuring: Foreclose 1 active loan to lower your EMI burden, AND increase your usable salary by ₹{loops_t2 * 5000:,} to cross the approval threshold.")

    # --- TRACK 3: Pure Wealth & Income Builder ---
    t3 = raw_features.copy()
    loops_t3 = 0
    while predict_score(t3) < 650 and loops_t3 < 25:
        loops_t3 += 1
        t3['average_usable_salary'] += 5000
        t3['average_month_end_balance'] += 3000
        
    if predict_score(t3) >= 650:
        paths.append(f"Wealth Builder: Focus purely on liquidity. Without changing your debts or past behavior, you will need to increase your usable salary by ₹{loops_t3 * 5000:,} and maintain a ₹{loops_t3 * 3000:,} higher month-end balance to qualify.")

    # Fallback if the profile is too risky to save realistically
    if not paths:
        paths.append("Comprehensive Improvement: Your profile requires a complete overhaul. Clear existing unsecured debts, maintain significantly higher end-of-month balances, and ensure 0 bounced transactions for 6 months.")

    return paths