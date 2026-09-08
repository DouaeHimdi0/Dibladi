ALTER TABLE vendor_requests 
ADD COLUMN bank_account_holder_name VARCHAR(255),
ADD COLUMN bank_name VARCHAR(255),
ADD COLUMN bank_rib VARCHAR(24);

ALTER TABLE vendors 
ADD COLUMN bank_account_holder_name VARCHAR(255),
ADD COLUMN bank_name VARCHAR(255),
ADD COLUMN bank_rib VARCHAR(24);
