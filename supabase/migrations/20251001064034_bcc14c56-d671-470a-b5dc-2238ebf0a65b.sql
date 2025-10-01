-- Temporarily allow public access to financial categories and transactions
-- This will be replaced with proper auth-based policies later

-- Drop existing restrictive policies for financial_categories
DROP POLICY IF EXISTS "Admin can manage financial categories" ON financial_categories;
DROP POLICY IF EXISTS "Group leaders can view their group financial categories" ON financial_categories;

-- Add temporary public policies for financial_categories
CREATE POLICY "Temporary public read access for financial categories" 
ON financial_categories FOR SELECT 
USING (true);

CREATE POLICY "Temporary public write access for financial categories" 
ON financial_categories FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Temporary public update access for financial categories" 
ON financial_categories FOR UPDATE 
USING (true);

CREATE POLICY "Temporary public delete access for financial categories" 
ON financial_categories FOR DELETE 
USING (true);

-- Drop existing restrictive policies for financial_transactions
DROP POLICY IF EXISTS "Group leaders can manage their group financial transactions" ON financial_transactions;
DROP POLICY IF EXISTS "Admin can manage financial transactions" ON financial_transactions;

-- Add temporary public policies for financial_transactions
CREATE POLICY "Temporary public read access for financial transactions" 
ON financial_transactions FOR SELECT 
USING (true);

CREATE POLICY "Temporary public write access for financial transactions" 
ON financial_transactions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Temporary public update access for financial transactions" 
ON financial_transactions FOR UPDATE 
USING (true);

CREATE POLICY "Temporary public delete access for financial transactions" 
ON financial_transactions FOR DELETE 
USING (true);