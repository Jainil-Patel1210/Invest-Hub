--  USER TABLE
INSERT INTO "User" (User_ID, User_Type, Email, Registered_At)VALUES
-- Analysts (1–10)
(1, 'Analyst', 'aarav.mehta@gmail.com', '2024-12-01'),
(2, 'Analyst', 'sneha.rao@gmail.com', '2024-12-03'),
(3, 'Analyst', 'kunal.singh@gmail.com', '2024-12-04'),
(4, 'Analyst', 'riya.shah@gmail.com', '2024-12-05'),
(5, 'Analyst', 'aditya.verma@gmail.com', '2024-12-06'),
(6, 'Analyst', 'neha.iyer@gmail.com', '2024-12-07'),
(7, 'Analyst', 'rahul.kapoor@gmail.com', '2024-12-08'),
(8, 'Analyst', 'ananya.das@gmail.com', '2024-12-09'),
(9, 'Analyst', 'vikram.desai@gmail.com', '2024-12-10'),
(10, 'Analyst', 'pooja.bhatt@gmail.com', '2024-12-11'),

-- Brokers (Retail + Institutional)
(11, 'Broker', 'support@zerodha.com', '2023-01-01'),
(12, 'Broker', 'help@upstox.com', '2023-01-02'),
(13, 'Broker', 'care@groww.in', '2023-01-03'),
(14, 'Broker', 'contact@angelone.in', '2023-01-04'),
(15, 'Broker', 'info@5paisa.com', '2023-01-05'),
(16, 'Broker', 'support@icicisecurities.com', '2023-01-06'),
(17, 'Broker', 'inquiries@kotakinstitutional.com', '2023-01-07'),
(18, 'Broker', 'contact@morganstanley.com', '2023-01-08'),
(19, 'Broker', 'info@goldmansachs.com', '2023-01-09'),
(20, 'Broker', 'services@axiscapital.in', '2023-01-10'),

-- FIIs (21–30)
(21, 'Investor', 'blackrock.global@gmail.com', '2024-11-01'),
(22, 'Investor', 'vanguard@gmail.com', '2024-11-02'),
(23, 'Investor', 'temasek@gmail.com', '2024-11-03'),
(24, 'Investor', 'gic@gmail.com', '2024-11-04'),
(25, 'Investor', 'fidelity@gmail.com', '2024-11-05'),
(26, 'Investor', 'capitalgroup@gmail.com', '2024-11-06'),
(27, 'Investor', 'aberdeen@gmail.com', '2024-11-07'),
(28, 'Investor', 'nomura@gmail.com', '2024-11-08'),
(29, 'Investor', 'allianz@gmail.com', '2024-11-09'),
(30, 'Investor', 'ubs@gmail.com', '2024-11-10'),

-- DIIs (31–40)
(31, 'Investor', 'licindia@gmail.com', '2024-11-11'),
(32, 'Investor', 'sbi.mf@gmail.com', '2024-11-12'),
(33, 'Investor', 'hdfc.asset@gmail.com', '2024-11-13'),
(34, 'Investor', 'icici.pru@gmail.com', '2024-11-14'),
(35, 'Investor', 'uti.mf@gmail.com', '2024-11-15'),
(36, 'Investor', 'birla.sunlife@gmail.com', '2024-11-16'),
(37, 'Investor', 'kotak.asset@gmail.com', '2024-11-17'),
(38, 'Investor', 'navi.mf@gmail.com', '2024-11-18'),
(39, 'Investor', 'quant.mf@gmail.com', '2024-11-19'),
(40, 'Investor', 'axis.mf@gmail.com', '2024-11-20'),

-- Retail Investors (41–50)
(41, 'Investor', 'amit.patel@gmail.com', '2025-01-01'),
(42, 'Investor', 'priya.sharma@gmail.com', '2025-01-01'),
(43, 'Investor', 'rohit.jain@gmail.com', '2025-01-02'),
(44, 'Investor', 'nisha.kumar@gmail.com', '2025-01-02'),
(45, 'Investor', 'manish.tiwari@gmail.com', '2025-01-03'),
(46, 'Investor', 'isha.rana@gmail.com', '2025-01-03'),
(47, 'Investor', 'deepak.nair@gmail.com', '2025-01-04'),
(48, 'Investor', 'shruti.dave@gmail.com', '2025-01-04'),
(49, 'Investor', 'sachin.gupta@gmail.com', '2025-01-05'),
(50, 'Investor', 'meera.joseph@gmail.com', '2025-01-05');

-----------------------------------------------------------------------------------------------------------

-- User_Info for Analysts (User_ID 1–10)
INSERT INTO User_Info (Email, fname, mname, lname, PAN_NO, Country) VALUES
('aarav.mehta@gmail.com', 'Aarav', NULL, 'Mehta', 'AARME1234M', 'India'),
('sneha.rao@gmail.com', 'Sneha', NULL, 'Rao', 'SNERA2345R', 'India'),
('kunal.singh@gmail.com', 'Kunal', NULL, 'Singh', 'KUNSI3456S', 'India'),
('riya.shah@gmail.com', 'Riya', NULL, 'Shah', 'RIYSH4567S', 'India'),
('aditya.verma@gmail.com', 'Aditya', NULL, 'Verma', 'ADIVE5678V', 'India'),
('neha.iyer@gmail.com', 'Neha', NULL, 'Iyer', 'NEHIY6789I', 'India'),
('rahul.kapoor@gmail.com', 'Rahul', NULL, 'Kapoor', 'RAHKP7890K', 'India'),
('ananya.das@gmail.com', 'Ananya', NULL, 'Das', 'ANADS8901D', 'India'),
('vikram.desai@gmail.com', 'Vikram', NULL, 'Desai', 'VIKDE9012D', 'India'),
('pooja.bhatt@gmail.com', 'Pooja', NULL, 'Bhatt', 'POOBH0123B', 'India');

-- User_Info for Brokers (User_ID 11–20)
INSERT INTO User_Info (Email, fname, mname, lname, PAN_NO, Country) VALUES
('support@zerodha.com', 'Zerodha Broking Ltd', NULL, NULL, 'ZEROD1234B', 'India'),
('help@upstox.com', 'Upstox Securities Pvt Ltd', NULL, NULL, 'UPSTO2345U', 'India'),
('care@groww.in', 'Groww Technologies Pvt Ltd', NULL, NULL, 'GROWW3456G', 'India'),
('contact@angelone.in', 'Angel One Ltd', NULL, NULL, 'ANGEL4567A', 'India'),
('info@5paisa.com', '5paisa Capital Ltd', NULL, NULL, 'FIVEP5678F', 'India'),
('support@icicisecurities.com', 'ICICI Securities Ltd', NULL, NULL, 'ICISE6789I', 'India'),
('inquiries@kotakinstitutional.com', 'Kotak Institutional Equities', NULL, NULL, 'KOTAK7890K', 'India'),
('contact@morganstanley.com', 'Morgan Stanley India Pvt Ltd', NULL, NULL, 'MORST8901M', 'USA'),
('info@goldmansachs.com', 'Goldman Sachs India', NULL, NULL, 'GOLDS9012G', 'USA'),
('services@axiscapital.in', 'Axis Capital Ltd', NULL, NULL, 'AXISC0123A', 'India');

-- User_Info for FIIs (User_ID 21–30)
INSERT INTO User_Info (Email, fname, mname, lname, PAN_NO, Country) VALUES
('blackrock.global@gmail.com', 'BlackRock Inc.', NULL, NULL, 'BLKRC1234F', 'USA'),
('vanguard@gmail.com', 'The Vanguard Group', NULL, NULL, 'VANGU2345G', 'USA'),
('temasek@gmail.com', 'Temasek Holdings', NULL, NULL, 'TEMAS3456T', 'Singapore'),
('gic@gmail.com', 'GIC Private Limited', NULL, NULL, 'GICPL4567G', 'Singapore'),
('fidelity@gmail.com', 'Fidelity Investments', NULL, NULL, 'FIDEL5678F', 'USA'),
('capitalgroup@gmail.com', 'Capital Group Companies', NULL, NULL, 'CAPGR6789C', 'USA'),
('aberdeen@gmail.com', 'Aberdeen Asset Management', NULL, NULL, 'ABERD7890A', 'UK'),
('nomura@gmail.com', 'Nomura Holdings Inc.', NULL, NULL, 'NOMUR8901N', 'Japan'),
('allianz@gmail.com', 'Allianz Global Investors', NULL, NULL, 'ALLIA9012A', 'Germany'),
('ubs@gmail.com', 'UBS Group AG', NULL, NULL, 'UBSGR0123U', 'Switzerland');

-- User_Info for DIIs (User_ID 31–40)
INSERT INTO User_Info (Email, fname, mname, lname, PAN_NO, Country) VALUES
('licindia@gmail.com', 'Life Insurance Corporation of India', NULL, NULL, 'LICIN1234D', 'India'),
('sbi.mf@gmail.com', 'SBI Mutual Fund', NULL, NULL, 'SBIMF2345D', 'India'),
('hdfc.asset@gmail.com', 'HDFC Asset Management', NULL, NULL, 'HDFCA3456D', 'India'),
('icici.pru@gmail.com', 'ICICI Prudential AMC', NULL, NULL, 'ICICP4567D', 'India'),
('uti.mf@gmail.com', 'UTI Mutual Fund', NULL, NULL, 'UTIMF5678D', 'India'),
('birla.sunlife@gmail.com', 'Aditya Birla Sun Life AMC', NULL, NULL, 'BIRSU6789D', 'India'),
('kotak.asset@gmail.com', 'Kotak Mahindra Asset Management', NULL, NULL, 'KOTAS7890D', 'India'),
('navi.mf@gmail.com', 'Navi Mutual Fund', NULL, NULL, 'NAVIM8901D', 'India'),
('quant.mf@gmail.com', 'Quant Mutual Fund', NULL, NULL, 'QUANT9012D', 'India'),
('axis.mf@gmail.com', 'Axis Mutual Fund', NULL, NULL, 'AXISM0123D', 'India');

-- User_Info for Retail Investors (User_ID 41–50)
INSERT INTO User_Info (Email, fname, mname, lname, PAN_NO, Country) VALUES
('amit.patel@gmail.com', 'Amit', NULL, 'Patel', 'AMIPA1234P', 'India'),
('priya.sharma@gmail.com', 'Priya', NULL, 'Sharma', 'PRISH2345P', 'India'),
('rohit.jain@gmail.com', 'Rohit', NULL, 'Jain', 'ROHJA3456P', 'India'),
('nisha.kumar@gmail.com', 'Nisha', NULL, 'Kumar', 'NISKU4567P', 'India'),
('manish.tiwari@gmail.com', 'Manish', NULL, 'Tiwari', 'MANTI5678P', 'India'),
('isha.rana@gmail.com', 'Isha', NULL, 'Rana', 'ISHRA6789P', 'India'),
('deepak.nair@gmail.com', 'Deepak', NULL, 'Nair', 'DEENA7890P', 'India'),
('shruti.dave@gmail.com', 'Shruti', NULL, 'Dave', 'SHRDA8901P', 'India'),
('sachin.gupta@gmail.com', 'Sachin', NULL, 'Gupta', 'SACGU9012P', 'India'),
('meera.joseph@gmail.com', 'Meera', NULL, 'Joseph', 'MEEJO0123P', 'India');

-----------------------------------------------------------------------------------------------------------

-- Analysts (User_IDs 1–10)
INSERT INTO Address (User_ID, "Address") VALUES
(1, '101 A-Wing, Andheri East, Mumbai, Maharashtra'),
(1, '401 Skyline Apt, Powai, Mumbai, Maharashtra'),
(2, '23 Residency Road, Bangalore, Karnataka'),
(3, 'A-14 Sector 45, Noida, Uttar Pradesh'),
(4, 'B-22 Ellis Bridge, Ahmedabad, Gujarat'),
(5, 'D-11 Koregaon Park, Pune, Maharashtra'),
(6, 'H-6 Anna Nagar, Chennai, Tamil Nadu'),
(7, 'Flat 3A, Salt Lake, Kolkata, West Bengal'),
(8, '201 Park Street, Bhubaneswar, Odisha'),
(9, '1007 MG Road, Indore, Madhya Pradesh'),
(10, 'C-4 Connaught Place, New Delhi, Delhi'),

-- Brokers (User_IDs 11–20)
(11, 'Zerodha HQ, 1533, 19th Main Rd, HSR Layout, Bangalore'),
(12, 'Upstox, Sunshine Towers, Senapati Bapat Marg, Mumbai'),
(13, 'Groww, Bellandur, Outer Ring Road, Bangalore'),
(14, 'Angel One, Gopal Bhavan, CST Road, Mumbai'),
(15, '5Paisa, A-309, Dynasty Business Park, Mumbai'),
(16, 'ICICI Securities, Kamala Mills, Mumbai'),
(17, 'Kotak Institutional, Nariman Point, Mumbai'),
(18, 'Morgan Stanley, BKC, Mumbai'),
(19, 'Goldman Sachs, Bengaluru Campus, Bangalore'),
(20, 'Axis Capital, Worli, Mumbai'),

-- FIIs (User_IDs 21–30)
(21, 'BlackRock HQ, New York, USA'),
(22, 'Vanguard Group, Pennsylvania, USA'),
(23, 'Temasek Holdings, Singapore'),
(24, 'GIC, Shenton Way, Singapore'),
(25, 'Fidelity International, London, UK'),
(26, 'Capital Group, Los Angeles, USA'),
(27, 'Aberdeen Asset Management, Aberdeen, UK'),
(28, 'Nomura Holdings, Tokyo, Japan'),
(29, 'Allianz Global, Munich, Germany'),
(30, 'UBS, Zürich, Switzerland'),

-- DIIs (User_IDs 31–40)
(31, 'LIC HQ, Yogakshema Building, Mumbai'),
(32, 'SBI MF, Nariman Point, Mumbai'),
(33, 'HDFC AMC, HDFC House, Mumbai'),
(34, 'ICICI Prudential, Lower Parel, Mumbai'),
(35, 'UTI MF, BKC, Mumbai'),
(36, 'Birla Sun Life, Andheri East, Mumbai'),
(37, 'Kotak AMC, Goregaon East, Mumbai'),
(38, 'Navi MF, Koramangala, Bangalore'),
(39, 'Quant Mutual, Nariman Point, Mumbai'),
(40, 'Axis MF, Worli, Mumbai'),

-- Retail Investors (User_IDs 41–50)
(41, '23 Nehru Nagar, Patna, Bihar'),
(42, 'B-3 Nirman Vihar, New Delhi'),
(43, '11C Lajpat Nagar, Delhi'),
(44, 'C-9 Vashi, Navi Mumbai'),
(45, 'J-21 Kankarbagh, Patna, Bihar'),
(46, 'HIG-112 Indrapuri, Bhopal'),
(47, '89 Sector 21, Chandigarh'),
(48, 'Flat No 44, MG Road, Kochi'),
(49, 'C-2 Aliganj, Lucknow'),
(50, '202 Shastri Nagar, Jaipur');

-----------------------------------------------------------------------------------------------------------

-- Analysts (User_IDs 1–10)
INSERT INTO Phone_No (User_ID, Phone_No) VALUES
(1, '+91-9876543210'),
(1, '+91-9123456780'),
(2, '+91-9012345678'),
(3, '+91-9988776655'),
(4, '+91-8899776655'),
(5, '+91-7777888899'),
(6, '+91-9090909090'),
(7, '+91-9191919191'),
(8, '+91-9292929292'),
(9, '+91-9393939393'),
(10, '+91-9494949494'),

-- Brokers (User_IDs 11–20)
(11, '+91-18002666888'),
(12, '+91-18002102222'),
(13, '+91-18001035676'),
(14, '+91-18001020202'),
(15, '+91-18002585555'),
(16, '+91-18601234567'),
(17, '+91-18002770000'),
(18, '+91-18001231231'),
(19, '+91-18009998877'),
(20, '+91-18004567890'),

-- FIIs (User_IDs 21–30)
(21, '+1-2128105300'),
(22, '+1-6106691000'),
(23, '+65-68288822'),
(24, '+65-68896889'),
(25, '+44-2074166000'),
(26, '+1-2134869200'),
(27, '+44-1224632000'),
(28, '+81-362058111'),
(29, '+49-8938000'),
(30, '+41-446342111'),

-- DIIs (User_IDs 31–40)
(31, '+91-2222040000'),
(32, '+91-2222916600'),
(33, '+91-2222877700'),
(34, '+91-2224908800'),
(35, '+91-2226671100'),
(36, '+91-2226888000'),
(37, '+91-2226566600'),
(38, '+91-8046222600'),
(39, '+91-2222021300'),
(40, '+91-2226117000'),

-- Retail Investors (User_IDs 41–50)
(41, '+91-9876512345'),
(42, '+91-9876501234'),
(43, '+91-9833123456'),
(44, '+91-9822223344'),
(45, '+91-9811122233'),
(46, '+91-9877788888'),
(47, '+91-9789456123'),
(48, '+91-9765432100'),
(49, '+91-9654321876'),
(50, '+91-9643218765');

-----------------------------------------------------------------------------------------------------------

INSERT INTO Follows (Investor_ID, Analyst_ID) VALUES
(21, 2)
(23, 5), (23, 7),
(24,1),
(25, 3), (25, 6),
(26, 4),
(27, 2), (27, 5),
(28, 1), (28, 3),
(29, 6),
(31,3),
(32, 2), (32, 5),
(33, 1), (33, 4),
(34, 3), (34, 6),
(35, 2), (35, 7),
(36, 1), (36, 4),
(37, 3), (37, 5),
(38, 2), (38, 6),
(39, 1), (39, 4),
(41, 1), (41, 2),
(42, 3), (42, 4),
(43, 5), (43, 1), (43, 6),
(44, 2), (44, 7),
(45, 3), (45, 8), (45, 4),
(46, 5), (46, 6),
(47, 7), (47, 8),
(48, 9), (48, 10),
(49, 2), (49, 6), (49, 10),
(50, 3), (50, 5);

-----------------------------------------------------------------------------------------------------------

-- Retail Brokers with Retail Investors
INSERT INTO Provides_Platform_To (Broker_ID, Investor_ID) VALUES
(11, 41), (11, 42), (11, 43),
(12, 44), (12, 45), (12,41), (12,42),
(13, 46), (13, 41), (13, 47), (13.45)
(14, 48), (14, 49),
(15, 50);

-- Institutional Brokers with FIIs
INSERT INTO Provides_Platform_To (Broker_ID, Investor_ID) VALUES
(16, 21), (16, 22),
(17, 23), (17, 24),
(18, 25), (18, 26), (18, 23),
(19, 27), (19, 28), (19,24),
(20, 29), (20, 30);

-- Institutional Brokers with DIIs
INSERT INTO Provides_Platform_To (Broker_ID, Investor_ID) VALUES
(16, 31), (16, 32),
(17, 33), (17, 34),
(18, 35), (18, 36), (18,33), (18,34),
(19, 37), (19, 38), (19,34),
(20, 39), (20, 40);

-----------------------------------------------------------------------------------------------------------

INSERT INTO Analyst (Analyst_ID, Reg_No, Experiance) VALUES
(1, 'ANL123456789', 5),
(2, 'ANL234567890', 7),
(3, 'ANL345678901', 4),
(4, 'ANL456789012', 6),
(5, 'ANL567890123', 8),
(6, 'ANL678901234', 3),
(7, 'ANL789012345', 9),
(8, 'ANL890123456', 5),
(9, 'ANL901234567', 7),
(10, 'ANL012345678', 4);

-----------------------------------------------------------------------------------------------------------

INSERT INTO Broker (Broker_ID, Broker_Licence_No, Firm_Name, Experiance_Years, Commision_Rate) VALUES
(11, 'BROK1234567890', 'Zerodha', 12, 0.03),
(12, 'BROK2345678901', 'Upstox', 10, 0.02),
(13, 'BROK3456789012', 'Groww', 8, 0.01),
(14, 'BROK4567890123', 'Angel One', 15, 0.05),
(15, 'BROK5678901234', '5Paisa', 9, 0.02),
(16, 'BROK6789012345', 'ICICI Securities', 20, 0.05),
(17, 'BROK7890123456', 'Kotak Institutional', 18, 0.04),
(18, 'BROK8901234567', 'Morgan Stanley', 25, 0.07),
(19, 'BROK9012345678', 'Goldman Sachs', 22, 0.06),
(20, 'BROK0123456789', 'Axis Capital', 16, 0.05);

-----------------------------------------------------------------------------------------------------------

INSERT INTO Investor (Investor_ID, investor_type) VALUES
-- FIIs
(21, 'FII'),
(22, 'FII'),
(23, 'FII'),
(24, 'FII'),
(25, 'FII'),
(26, 'FII'),
(27, 'FII'),
(28, 'FII'),
(29, 'FII'),
(30, 'FII'),

-- DIIs
(31, 'DII'),
(32, 'DII'),
(33, 'DII'),
(34, 'DII'),
(35, 'DII'),
(36, 'DII'),
(37, 'DII'),
(38, 'DII'),
(39, 'DII'),
(40, 'DII'),

-- Retail Investors
(41, 'Retail_Investor'),
(42, 'Retail_Investor'),
(43, 'Retail_Investor'),
(44, 'Retail_Investor'),
(45, 'Retail_Investor'),
(46, 'Retail_Investor'),
(47, 'Retail_Investor'),
(48, 'Retail_Investor'),
(49, 'Retail_Investor'),
(50, 'Retail_Investor');

-----------------------------------------------------------------------------------------------------------

--  SECTOR TABLE
INSERT INTO Sector (Sector_Name, Sector_Size)
VALUES
('Information Technology', 850000),
('Finance', 1200000),
('Healthcare', 750000),
('Consumer Goods', 680000),
('Consumer Services', 680000),
('Energy', 950000),
('Telecommunications', 400000),
('Automobile', 720000),
('Infrastructure', 620000),
('Pharmaceuticals', 580000),
('Real Estate', 510000),
('Industrials', 810000),
('Materials', 600000);

-----------------------------------------------------------------------------------------------------------

INSERT INTO FII (FII_ID, Reg_No, Investment_Sector, Total_Investment)
VALUES
(21, 'FIIREG00000121', 'Finance', 1800000),
(22, 'FIIREG00000122', 'Information Technology', 15000000),
(23, 'FIIREG00000123', 'Pharmaceuticals', 170000000),
(24, 'FIIREG00000124', 'Consumer Goods', 14000000),
(25, 'FIIREG00000125', 'Energy', 16000000),
(26, 'FIIREG00000126', 'Automobile', 155000000),
(27, 'FIIREG00000127', 'Infrastructure', 1405000),
(28, 'FIIREG00000128', 'Telecommunications', 10030000),
(29, 'FIIREG00000129', 'Real Estate', 12500000),
(30, 'FIIREG00000130', 'Healthcare', 13500000);

-----------------------------------------------------------------------------------------------------------

INSERT INTO DII (DII_ID, Reg_No, Category, Investment_Sector, Total_Investment)
VALUES
(31, 'DIIREG00000131', 'Mutual Fund', 'Finance', 200000),
(32, 'DIIREG00000132', 'Insurance', 'Infrastructure', 185000),
(33, 'DIIREG00000133', 'Mutual Fund', 'Healthcare', 175000),
(34, 'DIIREG00000134', 'Pension Fund', 'Energy', 160000),
(35, 'DIIREG00000135', 'Mutual Fund', 'Automobile', 155000),
(36, 'DIIREG00000136', 'Insurance', 'Information Technology', 180000),
(37, 'DIIREG00000137', 'Pension Fund', 'Telecommunications', 140000),
(38, 'DIIREG00000138', 'Mutual Fund', 'Consumer Goods', 150000),
(39, 'DIIREG00000139', 'Insurance', 'Real Estate', 135000),
(40, 'DIIREG00000140', 'Pension Fund', 'Pharmaceuticals', 145000);

-----------------------------------------------------------------------------------------------------------

INSERT INTO Retail_Investor (Investor_ID, DOB, Account_Balance)
VALUES
(41, '1990-05-14', 250000.75),
(42, '1992-08-20', 180000.50),
(43, '1988-11-02', 320000.00),
(44, '1995-03-17', 150500.25),
(45, '1991-07-09', 210000.00),
(46, '1993-12-25', 175000.40),
(47, '1989-04-30', 300000.90),
(48, '1994-10-11', 190000.00),
(49, '1996-06-06', 160500.80),
(50, '1990-01-23', 275000.30);

-----------------------------------------------------------------------------------------------------------

INSERT INTO Industry (Industry_Name, Sector_Name)
VALUES
('Software Services', 'Information Technology'),
('Banking', 'Finance'),
('Insurance', 'Finance'),
('Biotechnology', 'Healthcare'),
('Personal Care', 'Consumer Goods'),
('Oil & Gas', 'Energy'),
('Telecom Services', 'Telecommunications'),
('Automobile Manufacturing', 'Automobile'),
('Construction', 'Infrastructure'),
('Pharmaceutical Manufacturing', 'Pharmaceuticals'),
('Real Estate Development', 'Real Estate'),
('IT Consulting', 'Information Technology'),
('Investment Services', 'Finance'),
('Medical Equipment', 'Healthcare'),
('Beverages', 'Consumer Goods'),
('Power Generation', 'Energy'),
('Mobile Manufacturing', 'Telecommunications'),
('Auto Components', 'Automobile'),
('Urban Infrastructure', 'Infrastructure'),
('Drug Discovery', 'Pharmaceuticals');
('FMCG', 'Consumer Goods'),
('Telecommunications Services', 'Telecommunications'),
('Automobiles Manufacturing', 'Automobile'),
('Construction & Engineering','Infrastructure'),
('NBFC', 'Finance'),
('Jewelry', 'Consumer Goods'),
('Food Delivery', 'Consumer Services'),
('Internet Services', 'Consumer Services'),
('Steel', 'Materials'),
('Asset Management', 'Finance'),
('Electricity Generation', 'Energy'),
('Renewable Energy', 'Energy'),
('Logistics', 'Industrials'),
('FinTech', 'Information Technology'),
('E-Commerce', 'Consumer Goods'),
('Houshold Appliances', 'Consumer Goods');

-----------------------------------------------------------------------------------------------------------

INSERT INTO Company (Company_Name, CEO, Founded_Year, Industry_Name, Headquarter, Total_Shares, NR_QTR, Gross_QTR_Profit, EPS)
VALUES
('Tata Consultancy Services', 'Rajesh Gopinathan', '1968', 'Software Services', 'Mumbai', 3700000000, 57500.00, 20000.00, 110.5),
('Infosys Ltd.', 'Salil Parekh', '1981', 'Software Services', 'Bengaluru', 4300000000, 40000.00, 14500.00, 56.3),
('HDFC Bank Ltd.', 'Sashidhar Jagdishan', '1994', 'Banking', 'Mumbai', 5500000000, 65000.00, 27000.00, 88.4),
('ICICI Bank Ltd.', 'Sandeep Bakhshi', '1994', 'Banking', 'Mumbai', 6700000000, 62000.00, 26000.00, 84.2),
('Sun Pharmaceutical', 'Dilip Shanghvi', '1983', 'Pharmaceutical Manufacturing', 'Mumbai', 2400000000, 36000.00, 14500.00, 42.6),
('ITC Ltd.', 'Sanjiv Puri', '1910', 'FMCG', 'Kolkata', 12300000000, 72000.00, 23000.00, 15.2),
('Reliance Industries', 'Mukesh Ambani', '1966', 'Oil & Gas', 'Mumbai', 6400000000, 230000.00, 90000.00, 130.9),
('Bharti Airtel', 'Gopal Vittal', '1995', 'Telecommunications Services', 'New Delhi', 5400000000, 45000.00, 16500.00, 40.7),
('Maruti Suzuki', 'Hisashi Takeuchi', '1981', 'Automobiles Manufacturing', 'New Delhi', 302000000, 34000.00, 12500.00, 89.1),
('Larsen & Toubro', 'S. N. Subrahmanyan', '1938', 'Construction & Engineering', 'Mumbai', 1400000000, 48000.00, 17000.00, 70.3),
('Cipla Ltd.', 'Umang Vohra', '1935', 'Pharmaceutical Manufacturing', 'Mumbai', 805000000, 29500.00, 11000.00, 33.8),
('DLF Ltd.', 'Ashok Tyagi', '1946', 'Real Estate Development', 'Gurugram', 495000000, 18500.00, 7800.00, 24.6),
('HCL Technologies', 'C. Vijayakumar', '1976', 'Software Services', 'Noida', 2720000000, 38500.00, 14500.00, 49.9),
('Axis Bank', 'Amitabh Chaudhry', '1993', 'Banking', 'Mumbai', 6000000000, 58000.00, 23000.00, 78.5),
('Bajaj Housing Finance', 'Atul Jain', '2015', 'NBFC', 'Pune', 1000000000, 13500.00, 5200.00, 25.1),
('Godrej Consumer Products', 'Sudhir Sitapati', '2001', 'FMCG', 'Mumbai', 1020000000, 14500.00, 5200.00, 31.7),
('Oil & Natural Gas Corp.', 'Arun Kumar Singh', '1956', 'Oil & Gas', 'New Delhi', 12500000000, 95000.00, 35000.00, 40.2),
('Vodafone Idea', 'Akshaya Moondra', '2018', 'Telecommunications Services', 'Mumbai', 4900000000, 31000.00, 8000.00, -12.4),
('Tata Elxsi', 'Manoj Raghavan', '1989', 'Software Services', 'Bengaluru', 620000000, 8200.00, 2900.00, 95.6),
('Titan Company', 'C. K. Venkataraman', '1984', 'Jewellery', 'Bengaluru', 885000000, 16000.00, 5900.00, 63.2),
('Zomato Ltd.', 'Deepinder Goyal', '2008', 'Food Delivery', 'Gurugram', 780000000, 2600.00, 850.00, -3.6),
('One 97 Communications', 'Vijay Shekhar Sharma', '2000', 'Internet Services', 'Noida', 640000000, 2800.00, 900.00, -5.1),
('JSW Steel', 'Sajjan Jindal', '1982', 'Steel', 'Mumbai', 2400000000, 72000.00, 23000.00, 49.4),
('Dr. Reddys Laboratories', 'Erez Israeli', '1984', 'Pharmaceutical Manufacturing', 'Hyderabad', 166000000, 22000.00, 8700.00, 70.1),
('Macrotech Developers', 'Abhishek Lodha', '1995', 'Real Estate Development', 'Mumbai', 500000000, 15000.00, 5400.00, 22.8),
('Wipro Ltd.', 'Thierry Delaporte', '1945', 'Software Services', 'Bengaluru', 5450000000, 38500.00, 13000.00, 38.6),
('Bajaj Finance', 'Sanjiv Bajaj', '1987', 'NBFC', 'Pune', 605000000, 42000.00, 15500.00, 74.3),
('ICICI Lombard General Ins.', 'Bhargav Dasgupta', '2001', 'Insurance', 'Mumbai', 460000000, 17500.00, 6300.00, 27.4),
('HDFC Asset Management Co.', 'Navneet Munot', '1999', 'Asset Management', 'Mumbai', 212000000, 12500.00, 4300.00, 39.5),
('NTPC Ltd.', 'Gurdeep Singh', '1975', 'Electricity Generation', 'New Delhi', 9800000000, 98000.00, 42000.00, 45.9);

-- New companies for IPOs (Closed, Ongoing, Upcoming)
INSERT INTO Company (Company_Name, CEO, Founded_Year, Industry_Name, Headquarter, Total_Shares, NR_QTR, Gross_QTR_Profit, EPS)
VALUES
-- For Closed IPOs
('MediCore Diagnostics', 'Dr. Neha Sharma', '2018', 'Biotechnology', 'Ahmedabad', 12000000, 95000000.00, 42000000.00, 5.2),
('EcoSmart Appliances', 'Rajesh Iyer', '2016', 'Consumer Electronics', 'Pune', 8000000, 72000000.00, 26000000.00, 4.1),
('TransLogistics Ltd.', 'Ankita Rao', '2014', 'Logistics', 'Kolkata', 10000000, 68000000.00, 23000000.00, 3.8),

-- For Ongoing IPOs
('GreenVolt Energy', 'Siddharth Menon', '2020', 'Renewable Energy', 'Jaipur', 9000000, 85000000.00, 31000000.00, 4.7),
('SnapFin Tech', 'Ishaan Arora', '2021', 'FinTech', 'Hyderabad', 7500000, 91000000.00, 30000000.00, 5.6),
('UrbanWare Retail', 'Meera Sinha', '2019', 'E-Commerce', 'Bengaluru', 11000000, 99000000.00, 37000000.00, 6.1),

-- For Upcoming IPOs
('NovaMed Pharma', 'Dr. Rakesh Ahuja', '2022', 'Pharmaceuticals Manufacturing', 'Chandigarh', 7000000, 56000000.00, 18000000.00, 3.3),
('TechPlaza Systems', 'Pooja Bhatt', '2023', 'Software Solutions', 'Nagpur', 6500000, 72000000.00, 29000000.00, 4.4),
('SmartInfra Projects', 'Vinod Kulkarni', '2020', 'Urban Infrastructure', 'Surat', 10000000, 88000000.00, 34000000.00, 4.9);

-----------------------------------------------------------------------------------------------------------

INSERT INTO Stock_Info (Stock_ID, Stock_Name, Company_Name)
VALUES
('TCS', 'Tata Consultancy Services', 'Tata Consultancy Services'),
('INFY', 'Infosys Ltd.', 'Infosys Ltd.'),
('HDFCBANK', 'HDFC Bank Ltd.', 'HDFC Bank Ltd.'),
('ICICIBANK', 'ICICI Bank Ltd.', 'ICICI Bank Ltd.'),
('SUNPHARMA', 'Sun Pharmaceutical', 'Sun Pharmaceutical'),
('ITC', 'ITC Ltd.', 'ITC Ltd.'),
('RELIANCE', 'Reliance Industries', 'Reliance Industries'),
('BHARTIARTL', 'Bharti Airtel', 'Bharti Airtel'),
('MARUTI', 'Maruti Suzuki', 'Maruti Suzuki'),
('LNT', 'Larsen & Toubro', 'Larsen & Toubro'),
('CIPLA', 'Cipla Ltd.', 'Cipla Ltd.'),
('DLF', 'DLF Ltd.', 'DLF Ltd.'),
('HCLTECH', 'HCL Technologies', 'HCL Technologies'),
('AXISBANK', 'Axis Bank', 'Axis Bank'),
('BAJAJHFL', 'Bajaj Housing Finance', 'Bajaj Housing Finance'),
('GODREJCP', 'Godrej Consumer Products', 'Godrej Consumer Products'),
('ONGC', 'Oil & Natural Gas Corp.', 'Oil & Natural Gas Corp.'),
('VODAFONE', 'Vodafone Idea', 'Vodafone Idea'),
('TATAELXSI', 'Tata Elxsi', 'Tata Elxsi'),
('TITAN', 'Titan Company', 'Titan Company'),
('ZOMATO', 'Zomato Ltd.', 'Zomato Ltd.'),
('PAYTM', 'One 97 Communications', 'One 97 Communications'),
('JSWSTEEL', 'JSW Steel', 'JSW Steel'),
('DRREDDY', 'Dr. Reddys Laboratories', 'Dr. Reddys Laboratories'),
('LODHA', 'Macrotech Developers', 'Macrotech Developers'),
('WIPRO', 'Wipro Ltd.', 'Wipro Ltd.'),
('BAJFINANCE', 'Bajaj Finance', 'Bajaj Finance'),
('ICICIGI', 'ICICI Lombard General Ins.', 'ICICI Lombard General Ins.'),
('HDFCAMC', 'HDFC Asset Management Co.', 'HDFC Asset Management Co.'),
('NTPC', 'NTPC Ltd.', 'NTPC Ltd.');

-----------------------------------------------------------------------------------------------------------

INSERT INTO Stock_Pricing (Stock_ID, Exchange, Current_Price)
VALUES
('TCS', 'NSE', 3840.50), ('TCS', 'BSE', 3835.90),
('INFY', 'NSE', 1475.20), ('INFY', 'BSE', 1472.50),
('HDFCBANK', 'NSE', 1620.80), ('HDFCBANK', 'BSE', 1618.60),
('ICICIBANK', 'NSE', 985.30), ('ICICIBANK', 'BSE', 984.20),
('SUNPHARMA', 'NSE', 1105.60), ('SUNPHARMA', 'BSE', 1103.90),
('ITC', 'NSE', 429.70), ('ITC', 'BSE', 428.80),
('RELIANCE', 'NSE', 2735.40), ('RELIANCE', 'BSE', 2731.50),
('BHARTIARTL', 'NSE', 885.60), ('BHARTIARTL', 'BSE', 883.10),
('MARUTI', 'NSE', 10620.00), ('MARUTI', 'BSE', 10615.80),
('LNT', 'NSE', 3225.20), ('LNT', 'BSE', 3220.00),
('CIPLA', 'NSE', 1180.90), ('CIPLA', 'BSE', 1178.20),
('DLF', 'NSE', 648.20), ('DLF', 'BSE', 645.90),
('HCLTECH', 'NSE', 1470.70), ('HCLTECH', 'BSE', 1469.10),
('AXISBANK', 'NSE', 1058.30), ('AXISBANK', 'BSE', 1055.80),
('BAJAJHFL', 'NSE', 520.60), ('BAJAJHFL', 'BSE', 519.40),
('GODREJCP', 'NSE', 1085.10), ('GODREJCP', 'BSE', 1082.50),
('ONGC', 'NSE', 185.30), ('ONGC', 'BSE', 184.90),
('VODAFONE', 'NSE', 11.20), ('VODAFONE', 'BSE', 11.10),
('TATAELXSI', 'NSE', 7080.50), ('TATAELXSI', 'BSE', 7075.60),
('TITAN', 'NSE', 3650.20), ('TITAN', 'BSE', 3648.10),
('ZOMATO', 'NSE', 138.50), ('ZOMATO', 'BSE', 138.00),
('PAYTM', 'NSE', 450.60), ('PAYTM', 'BSE', 448.70),
('JSWSTEEL', 'NSE', 855.90), ('JSWSTEEL', 'BSE', 854.00),
('DRREDDY', 'NSE', 5450.20), ('DRREDDY', 'BSE', 5445.90),
('LODHA', 'NSE', 990.70), ('LODHA', 'BSE', 988.30),
('WIPRO', 'NSE', 445.50), ('WIPRO', 'BSE', 443.80),
('BAJFINANCE', 'NSE', 7100.40), ('BAJFINANCE', 'BSE', 7095.30),
('ICICIGI', 'NSE', 1450.30), ('ICICIGI', 'BSE', 1448.90),
('HDFCAMC', 'NSE', 2850.20), ('HDFCAMC', 'BSE', 2845.80),
('NTPC', 'NSE', 322.40), ('NTPC', 'BSE', 321.70);

-----------------------------------------------------------------------------------------------------------

-- For Closed IPOs
INSERT INTO IPO (Symbol, Company_Name, Open_Date, Close_Date, Issue_Size, Issue_Price, Lot_Size, Exchange, IPO_Type, "Status", Listing_Date, Listing_Price, Final_GMP)
VALUES
('MEDICORE', 'MediCore Diagnostics', '2025-03-01', '2025-03-05', 3000000, 95.50, 150, 'NSE', 'MAIN_BOARD', 'Closed', '2025-03-15', NULL, 15.25),
('ECOSMART', 'EcoSmart Appliances', '2025-03-03', '2025-03-07', 2500000, 88.00, 100, 'BSE', 'SME', 'Closed', '2025-03-18', NULL, 12.40),
('TRANSLOG', 'TransLogistics Ltd.', '2025-03-05', '2025-03-09', 2800000, 77.25, 120, 'NSE', 'MAIN_BOARD', 'Closed', '2025-03-20', NULL, 10.75);

-- For Ongoing IPOs
INSERT INTO IPO (Symbol, Company_Name, Open_Date, Close_Date, Issue_Size, Issue_Price, Lot_Size, Exchange, IPO_Type, "Status", Listing_Date, Listing_Price, Final_GMP)
VALUES
('GREENVOLT', 'GreenVolt Energy', '2025-04-08', '2025-04-12', 2700000, 105.00, 130, 'BSE', 'MAIN_BOARD', 'Ongoing', '2025-04-22', NULL, NULL),
('SNAPFIN', 'SnapFin Tech', '2025-04-09', '2025-04-13', 3000000, 99.75, 140, 'NSE', 'SME', 'Ongoing', '2025-04-23', NULL, NULL),
('URBANWARE', 'UrbanWare Retail', '2025-04-10', '2025-04-14', 3200000, 112.60, 110, 'NSE', 'MAIN_BOARD', 'Ongoing', '2025-04-25', NULL, NULL);

-- For Upcoming IPOs
INSERT INTO IPO (Symbol, Company_Name, Open_Date, Close_Date, Issue_Size, Issue_Price, Lot_Size, Exchange, IPO_Type, "Status", Listing_Date, Listing_Price, Final_GMP)
VALUES
('NOVAMED', 'NovaMed Pharma', '2025-04-20', '2025-04-24', 2200000, 85.40, 100, 'BSE', 'MAIN_BOARD', 'Upcoming', '2025-05-03', NULL, NULL),
('TECHPLAZA', 'TechPlaza Systems', '2025-04-22', '2025-04-26', 2000000, 92.25, 90, 'NSE', 'SME', 'Upcoming', '2025-05-06', NULL, NULL),
('SMARTINFRA', 'SmartInfra Projects', '2025-04-24', '2025-04-28', 2500000, 97.80, 120, 'NSE', 'MAIN_BOARD', 'Upcoming', '2025-05-08', NULL, NULL);

--For Listed IPOs
INSERT INTO IPO (Symbol, Company_Name, Open_Date, Close_Date, Issue_Size, Issue_Price, Lot_Size, Exchange, IPO_Type, "Status", Listing_Date, Listing_Price, Final_GMP)
VALUES
('TCS', 'Tata Consultancy Services', '2004-07-29', '2004-08-02', 5000000000, 850.00, 10, 'BSE', 'MAIN_BOARD', 'Listed', '2004-08-25', 1040.00, 190.00),
('INFY', 'Infosys Ltd.', '1993-02-10', '1993-02-13', 120000000, 95.00, 100, 'NSE', 'MAIN_BOARD', 'Listed', '1993-03-01', 145.00, 50.00),
('HDFCBANK', 'HDFC Bank Ltd.', '1995-03-01', '1995-03-07', 400000000, 40.00, 50, 'Both', 'MAIN_BOARD', 'Listed', '1995-03-21', 1450, 90.00),

-----------------------------------------------------------------------------------------------------------

INSERT INTO Dividend (Stock_ID, Exchange, Payment_Date, Dividend_Amount, Payment_Method) VALUES
('TCS', 'NSE', '2025-03-15', 28, 'Cash'),
('TCS', 'BSE', '2025-03-15', 28, 'Cash'),
('INFY', 'NSE', '2025-03-03', 17.5, 'Cash'),
('INFY', 'BSE', '2025-03-03', 17.5, 'Cash'),
('ITC', 'NSE', '2025-03-04', 6, 'Cash'),
('ITC', 'BSE', '2025-03-04', 6, 'Cash'),
('HDFCBANK', 'NSE', '2025-03-05', 18, 'Cash'),
('HDFCBANK', 'BSE', '2025-03-05', 18, 'Cash'),
('RELIANCE', 'NSE', '2025-03-02', 9.5, 'Cash'),
('RELIANCE', 'BSE', '2025-03-02', 9.5, 'Cash'),
('WIPRO', 'NSE', '2025-03-03', 1, 'Stock'),
('WIPRO', 'BSE', '2025-03-03', 1, 'Stock'),
('TITAN', 'NSE', '2025-03-04', 8.5, 'Cash'),
('TITAN', 'BSE', '2025-03-04', 8.5, 'Cash'),
('BAJFINANCE', 'NSE', '2025-03-05', 30, 'Cash'),
('BAJFINANCE', 'BSE', '2025-03-05', 30, 'Cash'),
('AXISBANK', 'NSE', '2025-03-02', 14.25, 'Cash'),
('AXISBANK', 'BSE', '2025-03-02', 14.25, 'Cash'),
('DLF', 'NSE', '2025-03-03', 3.75, 'Stock'),
('DLF', 'BSE', '2025-03-03', 3.75, 'Stock');

-----------------------------------------------------------------------------------------------------------

--Trend inserts for March 3, 2025
INSERT INTO Trend (Stock_ID, Exchange, "Date", Open_Price, Close_Price, High_Price, Low_Price, Volume, Year_High, Year_Low, PE_Ratio, Market_Cap)
VALUES
('TCS', 'BSE', '2025-03-03', 3780.50, 3802.10, 3810.00, 3765.00, 1523000, 3900.00, 3100.00, 28.40, 140000000000.00),
('TCS', 'NSE', '2025-03-03', 3782.00, 3805.50, 3815.00, 3760.00, 1804500, 3900.00, 3100.00, 28.45, 140300000000.00),

('INFY', 'BSE', '2025-03-03', 1512.75, 1520.20, 1525.00, 1505.00, 980000, 1600.00, 1350.00, 26.80, 64800000000.00),
('INFY', 'NSE', '2025-03-03', 1513.00, 1522.50, 1526.00, 1506.00, 1024000, 1600.00, 1350.00, 26.85, 65000000000.00),

('HDFCBANK', 'BSE', '2025-03-03', 1650.50, 1659.80, 1665.00, 1642.00, 2100000, 1720.00, 1520.00, 24.10, 110000000000.00),
('HDFCBANK', 'NSE', '2025-03-03', 1652.00, 1662.30, 1668.00, 1640.00, 2145000, 1720.00, 1520.00, 24.15, 111200000000.00),

('ICICIBANK', 'BSE', '2025-03-03', 1008.50, 1015.90, 1020.00, 1002.00, 1450000, 1100.00, 930.00, 22.70, 91000000000.00),
('ICICIBANK', 'NSE', '2025-03-03', 1009.00, 1017.50, 1022.00, 1001.00, 1503000, 1100.00, 930.00, 22.75, 91200000000.00),

('SUNPHARMA', 'BSE', '2025-03-03', 1238.30, 1245.10, 1250.00, 1230.00, 870000, 1290.00, 1120.00, 31.20, 52000000000.00),
('SUNPHARMA', 'NSE', '2025-03-03', 1239.00, 1246.50, 1252.00, 1232.00, 894000, 1290.00, 1120.00, 31.25, 52200000000.00),

('ITC', 'BSE', '2025-03-03', 415.30, 417.10, 420.00, 412.00, 2450000, 450.00, 390.00, 23.10, 51500000000.00),
('ITC', 'NSE', '2025-03-03', 416.00, 417.50, 420.50, 413.00, 2505000, 450.00, 390.00, 23.15, 51700000000.00),

('RELIANCE', 'BSE', '2025-03-03', 2390.60, 2405.10, 2415.00, 2375.00, 4300000, 2480.00, 2150.00, 27.50, 155000000000.00),
('RELIANCE', 'NSE', '2025-03-03', 2392.00, 2407.80, 2416.00, 2378.00, 4412000, 2480.00, 2150.00, 27.60, 156000000000.00),

('BHARTIARTL', 'BSE', '2025-03-03', 1012.10, 1018.90, 1025.00, 1005.00, 1300000, 1080.00, 950.00, 29.90, 79000000000.00),
('BHARTIARTL', 'NSE', '2025-03-03', 1013.00, 1020.20, 1026.00, 1006.00, 1354000, 1080.00, 950.00, 29.95, 79200000000.00),

('MARUTI', 'BSE', '2025-03-03', 9955.00, 10012.20, 10080.00, 9900.00, 520000, 10400.00, 9100.00, 21.80, 87000000000.00),
('MARUTI', 'NSE', '2025-03-03', 9956.00, 10014.60, 10085.00, 9905.00, 540000, 10400.00, 9100.00, 21.85, 87200000000.00),

('LNT', 'BSE', '2025-03-03', 3598.20, 3610.10, 3625.00, 3580.00, 860000, 3790.00, 3100.00, 26.10, 62000000000.00),
('LNT', 'NSE', '2025-03-03', 3599.00, 3612.20, 3628.00, 3582.00, 875000, 3790.00, 3100.00, 26.15, 62200000000.00);

('CIPLA', 'BSE', '2025-03-03', 1232.00, 1240.50, 1245.00, 1225.00, 890000, 1320.00, 1100.00, 28.10, 43000000000.00),
('CIPLA', 'NSE', '2025-03-03', 1233.00, 1241.80, 1246.00, 1228.00, 912000, 1320.00, 1100.00, 28.15, 43100000000.00),

('DLF', 'BSE', '2025-03-03', 615.40, 620.30, 625.00, 610.00, 760000, 670.00, 550.00, 20.40, 29000000000.00),
('DLF', 'NSE', '2025-03-03', 616.00, 621.50, 626.00, 611.00, 782000, 670.00, 550.00, 20.45, 29200000000.00),

('HCLTECH', 'BSE', '2025-03-03', 1450.50, 1462.80, 1470.00, 1442.00, 1140000, 1550.00, 1320.00, 25.30, 58000000000.00),
('HCLTECH', 'NSE', '2025-03-03', 1452.00, 1465.10, 1472.00, 1445.00, 1182000, 1550.00, 1320.00, 25.35, 58200000000.00),

('AXISBANK', 'BSE', '2025-03-03', 999.20, 1006.40, 1012.00, 990.00, 1345000, 1070.00, 950.00, 23.10, 71000000000.00),
('AXISBANK', 'NSE', '2025-03-03', 1000.00, 1007.50, 1013.00, 991.00, 1378000, 1070.00, 950.00, 23.15, 71200000000.00),

('BAJAJHFL', 'BSE', '2025-03-03', 4750.00, 4795.00, 4820.00, 4700.00, 320000, 5100.00, 4300.00, 29.80, 53000000000.00),
('BAJAJHFL', 'NSE', '2025-03-03', 4752.00, 4798.50, 4825.00, 4705.00, 330000, 5100.00, 4300.00, 29.85, 53200000000.00),

('GODREJCP', 'BSE', '2025-03-03', 1085.60, 1092.10, 1100.00, 1078.00, 760000, 1150.00, 980.00, 33.20, 36000000000.00),
('GODREJCP', 'NSE', '2025-03-03', 1086.00, 1093.20, 1102.00, 1079.00, 790000, 1150.00, 980.00, 33.25, 36100000000.00),

('ONGC', 'BSE', '2025-03-03', 180.50, 182.00, 183.00, 178.50, 2550000, 200.00, 160.00, 11.60, 24000000000.00),
('ONGC', 'NSE', '2025-03-03', 181.00, 182.50, 183.20, 179.00, 2620000, 200.00, 160.00, 11.65, 24200000000.00),

('VODAFONE', 'BSE', '2025-03-03', 12.50, 12.80, 13.00, 12.20, 14200000, 16.00, 10.00, 0.00, 5000000000.00),
('VODAFONE', 'NSE', '2025-03-03', 12.60, 12.85, 13.10, 12.30, 14650000, 16.00, 10.00, 0.00, 5050000000.00),

('TATAELXSI', 'BSE', '2025-03-03', 7050.00, 7120.00, 7150.00, 6980.00, 180000, 7500.00, 6300.00, 48.00, 48000000000.00),
('TATAELXSI', 'NSE', '2025-03-03', 7055.00, 7125.50, 7160.00, 6985.00, 185000, 7500.00, 6300.00, 48.10, 48200000000.00),

('TITAN', 'BSE', '2025-03-03', 3625.00, 3652.00, 3665.00, 3590.00, 920000, 3900.00, 3300.00, 82.00, 88000000000.00),
('TITAN', 'NSE', '2025-03-03', 3628.00, 3655.20, 3668.00, 3592.00, 940000, 3900.00, 3300.00, 82.10, 88200000000.00),

('ZOMATO', 'BSE', '2025-03-03', 139.20, 141.10, 143.00, 138.00, 8100000, 160.00, 110.00, 0.00, 17000000000.00),
('ZOMATO', 'NSE', '2025-03-03', 139.50, 141.50, 143.50, 138.50, 8220000, 160.00, 110.00, 0.00, 17200000000.00),

('PAYTM', 'BSE', '2025-03-03', 620.00, 628.00, 635.00, 615.00, 2750000, 760.00, 520.00, 0.00, 19000000000.00),
('PAYTM', 'NSE', '2025-03-03', 621.00, 629.50, 636.00, 616.00, 2800000, 760.00, 520.00, 0.00, 19200000000.00),

('JSWSTEEL', 'BSE', '2025-03-03', 805.00, 812.00, 818.00, 798.00, 1320000, 860.00, 720.00, 20.90, 55000000000.00),
('JSWSTEEL', 'NSE', '2025-03-03', 806.00, 813.20, 819.00, 799.00, 1345000, 860.00, 720.00, 21.00, 55200000000.00),

('DRREDDY', 'BSE', '2025-03-03', 5755.00, 5802.00, 5825.00, 5700.00, 540000, 6000.00, 5300.00, 33.60, 70000000000.00),
('DRREDDY', 'NSE', '2025-03-03', 5758.00, 5805.50, 5830.00, 5705.00, 555000, 6000.00, 5300.00, 33.65, 70200000000.00),

('LODHA', 'BSE', '2025-03-03', 960.00, 972.00, 980.00, 950.00, 620000, 1050.00, 880.00, 17.60, 30000000000.00),
('LODHA', 'NSE', '2025-03-03', 961.00, 973.10, 981.00, 951.00, 630000, 1050.00, 880.00, 17.65, 30200000000.00),

('WIPRO', 'BSE', '2025-03-03', 510.20, 515.80, 520.00, 505.00, 1100000, 560.00, 470.00, 23.40, 44000000000.00),
('WIPRO', 'NSE', '2025-03-03', 511.00, 516.90, 521.00, 506.00, 1130000, 560.00, 470.00, 23.45, 44200000000.00),

('BAJFINANCE', 'BSE', '2025-03-03', 6850.00, 6902.00, 6930.00, 6780.00, 580000, 7400.00, 6600.00, 36.10, 82000000000.00),
('BAJFINANCE', 'NSE', '2025-03-03', 6852.00, 6904.50, 6935.00, 6785.00, 595000, 7400.00, 6600.00, 36.20, 82300000000.00),

('ICICIGI', 'BSE', '2025-03-03', 1370.00, 1382.00, 1390.00, 1355.00, 480000, 1440.00, 1240.00, 34.50, 28000000000.00),
('ICICIGI', 'NSE', '2025-03-03', 1372.00, 1383.50, 1392.00, 1357.00, 490000, 1440.00, 1240.00, 34.55, 28200000000.00),

('HDFCAMC', 'BSE', '2025-03-03', 2630.00, 2650.00, 2665.00, 2600.00, 400000, 2780.00, 2400.00, 30.20, 32000000000.00),
('HDFCAMC', 'NSE', '2025-03-03', 2632.00, 2652.50, 2668.00, 2605.00, 410000, 2780.00, 2400.00, 30.25, 32200000000.00),

('NTPC', 'BSE', '2025-03-03', 286.00, 288.20, 290.00, 283.00, 3000000, 310.00, 240.00, 10.60, 68000000000.00),
('NTPC', 'NSE', '2025-03-03', 286.50, 288.70, 291.00, 283.50, 3100000, 310.00, 240.00, 10.65, 68200000000.00);

-- March 4, 2025
INSERT INTO Trend (Stock_ID, Date, Exchange, Open_Price, Close_Price, High_Price, Low_Price, Volume, Year_High, Year_Low, PE_Ratio, Market_Cap)
VALUES
('TCS', '2025-03-04', 'BSE', 3200.00, 4002.65, 4100.00, 3180.00, 1000000, 3500.00, 3000.00, 28.5, 1200000000000),
('TCS', '2025-03-04', 'NSE', 3205.00, 4003.50, 4103.00, 3185.00, 1050000, 3505.00, 3005.00, 28.5, 1220000000000),

('INFY', '2025-03-04', 'BSE', 1465.00, 1468.50, 1480.00, 1460.00, 850000, 1490.00, 1305.00, 24.2, 630000000000),
('INFY', '2025-03-04', 'NSE', 1466.00, 1470.00, 1482.00, 1462.00, 900000, 1495.00, 1308.00, 24.2, 635000000000),

('HDFCBANK', '2025-03-04', 'BSE', 2530.00, 2535.60, 2545.00, 2520.00, 1050000, 2580.00, 2200.00, 21.4, 750000000000),
('HDFCBANK', '2025-03-04', 'NSE', 2532.00, 2537.00, 2550.00, 2518.00, 1100000, 2585.00, 2205.00, 21.4, 755000000000),

('ICICIBANK', '2025-03-04', 'BSE', 938.00, 940.50, 945.00, 931.00, 925000, 1000.00, 850.00, 18.8, 580000000000),
('ICICIBANK', '2025-03-04', 'NSE', 939.50, 942.00, 946.00, 932.00, 930000, 1005.00, 855.00, 18.8, 585000000000),

('SUNPHARMA', '2025-03-04', 'BSE', 610.00, 612.30, 615.00, 605.00, 550000, 620.00, 555.00, 22.5, 310000000000),
('SUNPHARMA', '2025-03-04', 'NSE', 611.00, 613.60, 616.00, 607.00, 600000, 622.00, 556.00, 22.5, 315000000000),

('ITC', '2025-03-04', 'BSE', 400.00, 402.50, 405.00, 398.00, 750000, 415.00, 370.00, 20.0, 250000000000),
('ITC', '2025-03-04', 'NSE', 401.00, 403.00, 406.00, 399.00, 800000, 416.00, 371.00, 20.0, 255000000000),

('RELIANCE', '2025-03-04', 'BSE', 2365.00, 2380.00, 2400.00, 2350.00, 1200000, 2450.00, 2100.00, 26.7, 1700000000000),
('RELIANCE', '2025-03-04', 'NSE', 2370.00, 2385.00, 2405.00, 2355.00, 1250000, 2455.00, 2105.00, 26.7, 1725000000000),

('BHARTIARTL', '2025-03-04', 'BSE', 730.00, 735.00, 740.00, 725.00, 950000, 780.00, 700.00, 22.9, 400000000000),
('BHARTIARTL', '2025-03-04', 'NSE', 732.00, 737.00, 742.00, 728.00, 1000000, 785.00, 705.00, 22.9, 405000000000),

('MARUTI', '2025-03-04', 'BSE', 9550.00, 9600.00, 9650.00, 9500.00, 600000, 9800.00, 8900.00, 30.1, 2500000000000),
('MARUTI', '2025-03-04', 'NSE', 9565.00, 9615.00, 9670.00, 9510.00, 650000, 9820.00, 8920.00, 30.1, 2550000000000),

('LNT', '2025-03-04', 'BSE', 1480.00, 1495.00, 1500.00, 1470.00, 700000, 1600.00, 1400.00, 24.5, 1200000000000),
('LNT', '2025-03-04', 'NSE', 1485.00, 1500.00, 1505.00, 1475.00, 750000, 1610.00, 1410.00, 24.5, 1225000000000);

-- March 4, 2025
INSERT INTO Trend (Stock_ID, Date, Exchange, Open_Price, Close_Price, High_Price, Low_Price, Volume, Year_High, Year_Low, PE_Ratio, Market_Cap)
VALUES
('CIPLA', '2025-03-04', 'BSE', 1025.00, 1030.00, 1040.00, 1015.00, 400000, 1100.00, 950.00, 18.0, 450000000000),
('CIPLA', '2025-03-04', 'NSE', 1026.00, 1032.00, 1041.00, 1016.00, 450000, 1102.00, 951.00, 18.0, 455000000000),

('DLF', '2025-03-04', 'BSE', 330.00, 335.50, 340.00, 325.00, 850000, 360.00, 300.00, 16.5, 150000000000),
('DLF', '2025-03-04', 'NSE', 331.00, 336.00, 341.00, 326.00, 900000, 362.00, 301.00, 16.5, 155000000000),

('HCLTECH', '2025-03-04', 'BSE', 1150.00, 1165.00, 1180.00, 1140.00, 600000, 1200.00, 1050.00, 23.0, 800000000000),
('HCLTECH', '2025-03-04', 'NSE', 1152.00, 1168.00, 1182.00, 1142.00, 650000, 1210.00, 1052.00, 23.0, 810000000000),

('AXISBANK', '2025-03-04', 'BSE', 865.00, 870.50, 875.00, 860.00, 950000, 900.00, 800.00, 19.0, 410000000000),
('AXISBANK', '2025-03-04', 'NSE', 866.00, 871.00, 876.00, 861.00, 1000000, 905.00, 805.00, 19.0, 415000000000),

('BAJAJHFL', '2025-03-04', 'BSE', 640.00, 645.00, 650.00, 635.00, 300000, 680.00, 600.00, 15.2, 250000000000),
('BAJAJHFL', '2025-03-04', 'NSE', 641.00, 646.00, 651.00, 636.00, 350000, 681.00, 601.00, 15.2, 255000000000),

('GODREJCP', '2025-03-04', 'BSE', 1275.00, 1285.00, 1290.00, 1265.00, 500000, 1350.00, 1200.00, 22.8, 400000000000),
('GODREJCP', '2025-03-04', 'NSE', 1276.00, 1286.00, 1292.00, 1266.00, 550000, 1352.00, 1202.00, 22.8, 405000000000),

('ONGC', '2025-03-04', 'BSE', 150.00, 152.00, 153.00, 148.00, 750000, 170.00, 140.00, 14.0, 180000000000),
('ONGC', '2025-03-04', 'NSE', 151.00, 153.00, 154.00, 149.00, 800000, 171.00, 141.00, 14.0, 185000000000),

('VODAFONE', '2025-03-04', 'BSE', 9.50, 9.60, 9.70, 9.40, 500000, 10.50, 8.00, 12.5, 25000000000),
('VODAFONE', '2025-03-04', 'NSE', 9.55, 9.65, 9.75, 9.45, 550000, 10.55, 8.05, 12.5, 26000000000),

('TATAELXSI', '2025-03-04', 'BSE', 2020.00, 2050.00, 2060.00, 2005.00, 400000, 2150.00, 1900.00, 27.4, 120000000000),
('TATAELXSI', '2025-03-04', 'NSE', 2025.00, 2055.00, 2065.00, 2010.00, 450000, 2155.00, 1905.00, 27.4, 122500000000),

('TITAN', '2025-03-04', 'BSE', 2400.00, 2425.00, 2440.00, 2385.00, 550000, 2500.00, 2200.00, 31.8, 1500000000000),
('TITAN', '2025-03-04', 'NSE', 2405.00, 2430.00, 2445.00, 2390.00, 600000, 2505.00, 2205.00, 31.8, 1525000000000);

-- March 4, 2025
INSERT INTO Trend (Stock_ID, Date, Exchange, Open_Price, Close_Price, High_Price, Low_Price, Volume, Year_High, Year_Low, PE_Ratio, Market_Cap)
VALUES
('ZOMATO', '2025-03-04', 'BSE', 100.00, 102.00, 103.00, 99.00, 1500000, 120.00, 80.00, 27.0, 80000000000),
('ZOMATO', '2025-03-04', 'NSE', 101.00, 103.00, 104.00, 100.00, 1600000, 121.00, 81.00, 27.0, 82000000000),

('PAYTM', '2025-03-04', 'BSE', 710.00, 720.00, 725.00, 705.00, 400000, 750.00, 650.00, 35.0, 70000000000),
('PAYTM', '2025-03-04', 'NSE', 712.00, 722.00, 726.00, 707.00, 420000, 755.00, 655.00, 35.0, 71000000000),

('JSWSTEEL', '2025-03-04', 'BSE', 820.00, 830.00, 835.00, 815.00, 800000, 860.00, 760.00, 12.5, 300000000000),
('JSWSTEEL', '2025-03-04', 'NSE', 822.00, 832.00, 836.00, 817.00, 850000, 862.00, 762.00, 12.5, 305000000000),

('DRREDDY', '2025-03-04', 'BSE', 4800.00, 4850.00, 4900.00, 4750.00, 200000, 5200.00, 4600.00, 20.0, 800000000000),
('DRREDDY', '2025-03-04', 'NSE', 4805.00, 4855.00, 4910.00, 4755.00, 220000, 5210.00, 4605.00, 20.0, 810000000000),

('LODHA', '2025-03-04', 'BSE', 1350.00, 1370.00, 1380.00, 1340.00, 500000, 1500.00, 1300.00, 18.0, 95000000000),
('LODHA', '2025-03-04', 'NSE', 1355.00, 1375.00, 1385.00, 1345.00, 550000, 1505.00, 1305.00, 18.0, 96000000000),

('WIPRO', '2025-03-04', 'BSE', 395.00, 398.00, 400.00, 390.00, 600000, 420.00, 350.00, 19.0, 250000000000),
('WIPRO', '2025-03-04', 'NSE', 396.00, 399.00, 401.00, 391.00, 650000, 421.00, 351.00, 19.0, 255000000000),

('BAJFINANCE', '2025-03-04', 'BSE', 7600.00, 7650.00, 7700.00, 7550.00, 150000, 8000.00, 7000.00, 45.0, 550000000000),
('BAJFINANCE', '2025-03-04', 'NSE', 7610.00, 7660.00, 7710.00, 7560.00, 170000, 8010.00, 7010.00, 45.0, 560000000000),

('ICICIGI', '2025-03-04', 'BSE', 1160.00, 1170.00, 1180.00, 1150.00, 400000, 1200.00, 1100.00, 28.0, 90000000000),
('ICICIGI', '2025-03-04', 'NSE', 1162.00, 1172.00, 1182.00, 1152.00, 450000, 1202.00, 1102.00, 28.0, 92000000000),

('HDFCAMC', '2025-03-04', 'BSE', 2850.00, 2870.00, 2900.00, 2820.00, 300000, 3000.00, 2700.00, 27.0, 55000000000),
('HDFCAMC', '2025-03-04', 'NSE', 2855.00, 2875.00, 2905.00, 2825.00, 320000, 3005.00, 2710.00, 27.0, 56000000000),

('NTPC', '2025-03-04', 'BSE', 155.00, 157.00, 158.00, 153.00, 700000, 165.00, 145.00, 12.0, 190000000000),
('NTPC', '2025-03-04', 'NSE', 156.00, 158.00, 159.00, 154.00, 750000, 166.00, 146.00, 12.0, 195000000000);

-- March 5, 2025
INSERT INTO Trend (Stock_ID, Date, Exchange, Open_Price, Close_Price, High_Price, Low_Price, Volume, Year_High, Year_Low, PE_Ratio, Market_Cap)
VALUES
('TCS', '2025-03-05', 'BSE', 3490.00, 4403.00, 4409.50, 3470.00, 500000, 3800.00, 3300.00, 30.0, 1300000000000),
('TCS', '2025-03-05', 'NSE', 3495.00, 4402.50, 4410.00, 3475.00, 520000, 3810.00, 3310.00, 30.0, 1310000000000),

('INFY', '2025-03-05', 'BSE', 1580.00, 1590.00, 1605.00, 1575.00, 600000, 1700.00, 1500.00, 28.0, 700000000000),
('INFY', '2025-03-05', 'NSE', 1585.00, 1595.00, 1610.00, 1578.00, 630000, 1710.00, 1510.00, 28.0, 710000000000),

('HDFCBANK', '2025-03-05', 'BSE', 1410.00, 1420.00, 1430.00, 1400.00, 500000, 1500.00, 1300.00, 22.0, 800000000000),
('HDFCBANK', '2025-03-05', 'NSE', 1412.00, 1422.00, 1432.00, 1402.00, 520000, 1510.00, 1310.00, 22.0, 810000000000),

('ICICIBANK', '2025-03-05', 'BSE', 905.00, 910.00, 920.00, 900.00, 600000, 950.00, 850.00, 18.0, 400000000000),
('ICICIBANK', '2025-03-05', 'NSE', 907.00, 912.00, 922.00, 902.00, 650000, 952.00, 852.00, 18.0, 405000000000),

('SUNPHARMA', '2025-03-05', 'BSE', 1100.00, 1120.00, 1130.00, 1095.00, 450000, 1200.00, 1000.00, 25.0, 400000000000),
('SUNPHARMA', '2025-03-05', 'NSE', 1105.00, 1125.00, 1135.00, 1100.00, 470000, 1210.00, 1010.00, 25.0, 410000000000),

('ITC', '2025-03-05', 'BSE', 255.00, 260.00, 265.00, 250.00, 700000, 280.00, 240.00, 20.0, 300000000000),
('ITC', '2025-03-05', 'NSE', 257.00, 262.00, 267.00, 252.00, 730000, 282.00, 242.00, 20.0, 305000000000),

('RELIANCE', '2025-03-05', 'BSE', 2420.00, 2435.00, 2450.00, 2400.00, 800000, 2600.00, 2300.00, 30.0, 1600000000000),
('RELIANCE', '2025-03-05', 'NSE', 2425.00, 2440.00, 2460.00, 2405.00, 820000, 2610.00, 2310.00, 30.0, 1610000000000),

('BHARTIARTL', '2025-03-05', 'BSE', 700.00, 710.00, 715.00, 695.00, 600000, 730.00, 650.00, 18.0, 400000000000),
('BHARTIARTL', '2025-03-05', 'NSE', 705.00, 715.00, 720.00, 700.00, 650000, 735.00, 655.00, 18.0, 405000000000),

('MARUTI', '2025-03-05', 'BSE', 7750.00, 7800.00, 7850.00, 7700.00, 400000, 8200.00, 7000.00, 22.0, 300000000000),
('MARUTI', '2025-03-05', 'NSE', 7760.00, 7810.00, 7860.00, 7710.00, 420000, 8210.00, 7010.00, 22.0, 305000000000),

('LNT', '2025-03-05', 'BSE', 1745.00, 1760.00, 1770.00, 1720.00, 350000, 1900.00, 1600.00, 16.0, 1100000000000),
('LNT', '2025-03-05', 'NSE', 1750.00, 1770.00, 1780.00, 1725.00, 370000, 1910.00, 1610.00, 16.0, 1110000000000);

-- March 5, 2025
INSERT INTO Trend (Stock_ID, Date, Exchange, Open_Price, Close_Price, High_Price, Low_Price, Volume, Year_High, Year_Low, PE_Ratio, Market_Cap)
VALUES
('CIPLA', '2025-03-05', 'BSE', 1000.00, 1010.00, 1020.00, 990.00, 550000, 1100.00, 950.00, 23.0, 380000000000),
('CIPLA', '2025-03-05', 'NSE', 1005.00, 1015.00, 1025.00, 995.00, 570000, 1110.00, 960.00, 23.0, 385000000000),

('DLF', '2025-03-05', 'BSE', 350.00, 355.00, 360.00, 340.00, 400000, 380.00, 320.00, 17.0, 250000000000),
('DLF', '2025-03-05', 'NSE', 355.00, 360.00, 365.00, 345.00, 420000, 385.00, 325.00, 17.0, 255000000000),

('HCLTECH', '2025-03-05', 'BSE', 1240.00, 1250.00, 1260.00, 1230.00, 600000, 1300.00, 1150.00, 20.0, 700000000000),
('HCLTECH', '2025-03-05', 'NSE', 1245.00, 1255.00, 1265.00, 1235.00, 620000, 1310.00, 1160.00, 20.0, 710000000000),

('AXISBANK', '2025-03-05', 'BSE', 850.00, 860.00, 870.00, 840.00, 500000, 920.00, 800.00, 18.0, 450000000000),
('AXISBANK', '2025-03-05', 'NSE', 855.00, 865.00, 875.00, 845.00, 530000, 925.00, 805.00, 18.0, 460000000000),

('BAJAJHFL', '2025-03-05', 'BSE', 860.00, 870.00, 880.00, 850.00, 400000, 900.00, 800.00, 19.0, 300000000000),
('BAJAJHFL', '2025-03-05', 'NSE', 865.00, 875.00, 885.00, 855.00, 420000, 910.00, 810.00, 19.0, 305000000000),

('GODREJCP', '2025-03-05', 'BSE', 1320.00, 1330.00, 1340.00, 1310.00, 380000, 1400.00, 1200.00, 22.0, 500000000000),
('GODREJCP', '2025-03-05', 'NSE', 1325.00, 1335.00, 1345.00, 1315.00, 400000, 1410.00, 1210.00, 22.0, 510000000000),

('ONGC', '2025-03-05', 'BSE', 160.00, 162.00, 163.00, 158.00, 700000, 170.00, 150.00, 15.0, 250000000000),
('ONGC', '2025-03-05', 'NSE', 162.00, 164.00, 165.00, 159.00, 720000, 172.00, 152.00, 15.0, 255000000000),

('VODAFONE', '2025-03-05', 'BSE', 8.50, 8.60, 8.70, 8.40, 1000000, 10.00, 7.00, 10.0, 180000000000),
('VODAFONE', '2025-03-05', 'NSE', 8.55, 8.65, 8.75, 8.45, 1050000, 10.10, 7.10, 10.0, 185000000000),

('TATAELXSI', '2025-03-05', 'BSE', 3150.00, 3180.00, 3200.00, 3100.00, 200000, 3400.00, 2900.00, 26.0, 200000000000),
('TATAELXSI', '2025-03-05', 'NSE', 3160.00, 3190.00, 3210.00, 3110.00, 210000, 3410.00, 2910.00, 26.0, 205000000000),

('TITAN', '2025-03-05', 'BSE', 2800.00, 2820.00, 2830.00, 2775.00, 450000, 3000.00, 2600.00, 24.0, 700000000000),
('TITAN', '2025-03-05', 'NSE', 2810.00, 2830.00, 2840.00, 2785.00, 470000, 3010.00, 2610.00, 24.0, 710000000000);

-- March 5, 2025
INSERT INTO Trend (Stock_ID, Date, Exchange, Open_Price, Close_Price, High_Price, Low_Price, Volume, Year_High, Year_Low, PE_Ratio, Market_Cap)
VALUES
('ZOMATO', '2025-03-05', 'BSE', 95.00, 97.00, 98.00, 93.00, 850000, 110.00, 85.00, 22.0, 60000000000),
('ZOMATO', '2025-03-05', 'NSE', 96.00, 98.00, 99.00, 94.00, 870000, 111.00, 86.00, 22.0, 61000000000),

('PAYTM', '2025-03-05', 'BSE', 550.00, 560.00, 570.00, 540.00, 600000, 600.00, 500.00, 25.0, 90000000000),
('PAYTM', '2025-03-05', 'NSE', 555.00, 565.00, 575.00, 545.00, 620000, 605.00, 505.00, 25.0, 91000000000),

('JSWSTEEL', '2025-03-05', 'BSE', 670.00, 680.00, 690.00, 660.00, 550000, 720.00, 650.00, 18.0, 200000000000),
('JSWSTEEL', '2025-03-05', 'NSE', 675.00, 685.00, 695.00, 665.00, 570000, 725.00, 655.00, 18.0, 205000000000),

('DRREDDY', '2025-03-05', 'BSE', 4200.00, 4250.00, 4300.00, 4150.00, 300000, 4400.00, 3800.00, 28.0, 700000000000),
('DRREDDY', '2025-03-05', 'NSE', 4210.00, 4260.00, 4310.00, 4160.00, 320000, 4410.00, 3810.00, 28.0, 710000000000),

('LODHA', '2025-03-05', 'BSE', 1200.00, 1220.00, 1230.00, 1180.00, 250000, 1300.00, 1100.00, 21.0, 350000000000),
('LODHA', '2025-03-05', 'NSE', 1210.00, 1230.00, 1240.00, 1190.00, 270000, 1310.00, 1110.00, 21.0, 355000000000),

('WIPRO', '2025-03-05', 'BSE', 430.00, 440.00, 445.00, 420.00, 500000, 480.00, 400.00, 19.0, 300000000000),
('WIPRO', '2025-03-05', 'NSE', 435.00, 445.00, 450.00, 425.00, 520000, 485.00, 405.00, 19.0, 305000000000),

('BAJFINANCE', '2025-03-05', 'BSE', 6300.00, 6350.00, 6400.00, 6200.00, 150000, 6700.00, 6000.00, 30.0, 1100000000000),
('BAJFINANCE', '2025-03-05', 'NSE', 6310.00, 6360.00, 6410.00, 6210.00, 160000, 6710.00, 6010.00, 30.0, 1110000000000),

('ICICIGI', '2025-03-05', 'BSE', 1475.00, 1485.00, 1495.00, 1465.00, 200000, 1550.00, 1400.00, 23.0, 80000000000),
('ICICIGI', '2025-03-05', 'NSE', 1480.00, 1490.00, 1500.00, 1470.00, 220000, 1560.00, 1410.00, 23.0, 81000000000),

('HDFCAMC', '2025-03-05', 'BSE', 3200.00, 3230.00, 3250.00, 3150.00, 180000, 3400.00, 3000.00, 20.0, 550000000000),
('HDFCAMC', '2025-03-05', 'NSE', 3210.00, 3240.00, 3260.00, 3160.00, 200000, 3410.00, 3010.00, 20.0, 560000000000),

('NTPC', '2025-03-05', 'BSE', 150.00, 155.00, 157.00, 148.00, 900000, 160.00, 140.00, 14.0, 300000000000),
('NTPC', '2025-03-05', 'NSE', 152.00, 157.00, 159.00, 150.00, 950000, 162.00, 142.00, 14.0, 310000000000);

-----------------------------------------------------------------------------------------------------------

INSERT INTO Watchlist (Investor_ID, Broker_ID, Watchlist_ID, "Name", Added_On) VALUES
(41, 11, 1, 'Top Gainers', '2025-03-01'),
(41, 11, 2, 'IT Sector Picks', '2025-03-02'),
(41, 12, 1, 'Value Stocks', '2025-03-03'),
(42, 11, 1, 'Blue Chips', '2025-03-01'),
(42, 11, 2, 'Dividend Stars', '2025-03-04'),
(43, 11, 1, 'Growth Picks', '2025-03-02'),
(44, 12, 1, 'Banking Watch', '2025-03-05'),
(45, 12, 1, 'Stable Returns', '2025-03-01'),
(45, 13, 1, 'Momentum Stocks', '2025-03-03'),
(46, 13, 1, 'My Watchlist', '2025-03-02'),
(47, 13, 1, 'Rising Stars', '2025-03-03'),
(48, 14, 1, 'Energy Picks', '2025-03-04'),
(49, 14, 1, 'Pharma Watch', '2025-03-01'),
(50, 15, 1, 'Top 5 Picks', '2025-03-03'),
-- Empty Watchlist: "To Be Researched"
 (49, 14, 2, 'To Be Researched', '2025-03-05'),

-- Empty Watchlist
(21, 16, 1, 'Growth Picks - Q1', '2025-03-03'),
(21, 16, 2, 'Stable Largecaps', '2025-03-04'),
(34, 17, 1, 'Dividend Yielders', '2025-03-04'),
(34, 17, 2, 'Balanced Bluechips', '2025-03-04'),
(35, 18, 1, 'Sectoral Mix', '2025-03-05'),
(22, 16, 1, 'Top India Holdings', '2025-03-04'),

--For FII/DIIs
(23, 17, 1, 'Midcap Opportunities', '2025-03-03'),
(23, 18, 1, 'Long-Term Plays', '2025-03-03'),
(24, 17, 1, 'Large Cap Safe Bets', '2025-03-04'),
(24, 19, 1, 'Defensive Picks', '2025-03-05'),
(33, 17, 1, 'Top Pharma', '2025-03-03'),
(33, 18, 1, 'New Positions', '2025-03-04'),
(34, 18, 1, 'Infra Focus', '2025-03-03'),
(34, 19, 1, 'Watch Closely', '2025-03-05');

-----------------------------------------------------------------------------------------------------------

INSERT INTO WL_Contains (Investor_ID, Broker_ID, Watchlist_ID, Stock_ID, Exchange) VALUES
(41, 11, 1, 'TCS', 'NSE'), 
(41, 11, 1, 'INFY', 'NSE'),
(41, 11, 1, 'RELIANCE', 'BSE'),
(41, 11, 2, 'TCS', 'BSE'), 
(41, 11, 2, 'HCLTECH', 'NSE'), 
(41, 11, 2, 'WIPRO', 'BSE'),
(41, 12, 1, 'ITC', 'NSE'), 
(41, 12, 1, 'NTPC', 'BSE'), 
(41, 12, 1, 'ONGC', 'NSE'),
(42, 11, 1, 'HDFCBANK', 'NSE'), 
(42, 11, 1, 'ICICIBANK', 'BSE'), 
(42, 11, 1, 'RELIANCE', 'NSE'),
(42, 11, 2, 'ITC', 'BSE'), 
(42, 11, 2, 'HDFCAMC', 'NSE'), 
(42, 11, 2, 'NTPC', 'NSE'),
(43, 11, 1, 'ZOMATO', 'NSE'), 
(43, 11, 1, 'PAYTM', 'BSE'), 
(43, 11, 1, 'TATAELXSI', 'NSE'),
(44, 12, 1, 'AXISBANK', 'NSE'), 
(44, 12, 1, 'ICICIBANK', 'NSE'), 
(44, 12, 1, 'HDFCBANK', 'BSE'),
(45, 12, 1, 'BAJFINANCE', 'NSE'), 
(45, 12, 1, 'HDFCAMC', 'BSE'), 
(45, 12, 1, 'DRREDDY', 'NSE'),
(45, 13, 1, 'ZOMATO', 'BSE'), 
(45, 13, 1, 'JSWSTEEL', 'NSE'), 
(45, 13, 1, 'SUNPHARMA', 'NSE'),
(46, 13, 1, 'BAJAJHFL', 'BSE'), 
(46, 13, 1, 'LODHA', 'NSE'), 
(46, 13, 1, 'DLF', 'BSE'),
(47, 13, 1, 'PAYTM', 'NSE'), 
(47, 13, 1, 'VODAFONE', 'BSE'), 
(47, 13, 1, 'ZOMATO', 'BSE'),
(48, 14, 1, 'RELIANCE', 'NSE'), 
(48, 14, 1, 'ONGC', 'BSE'), 
(48, 14, 1, 'NTPC', 'BSE'),
(49, 14, 1, 'CIPLA', 'NSE'), 
(49, 14, 1, 'SUNPHARMA', 'BSE'), 
(49, 14, 1, 'DRREDDY', 'BSE'),
(50, 15, 1, 'TCS', 'NSE'),
(50, 15, 1, 'INFY', 'BSE'),
(50, 15, 1, 'TITAN', 'NSE'),
(50, 15, 1, 'RELIANCE', 'BSE'),
(50, 15, 1, 'HDFCBANK', 'NSE');
(21, 16, 2, 'TCS', 'NSE'),
(21, 16, 2, 'INFY', 'BSE'),
(21, 16, 2, 'RELIANCE', 'NSE'),
(22, 16, 1, 'HDFCBANK', 'BSE'),
(22, 16, 1, 'ICICIBANK', 'NSE'),
(22, 16, 1, 'SUNPHARMA', 'NSE'),
(22, 16, 1, 'ITC', 'BSE'),
(22, 16, 1, 'LNT', 'NSE'),
(34, 17, 2, 'AXISBANK', 'BSE'),
(34, 17, 2, 'BAJAJHFL', 'NSE'),
(35, 18, 1, 'GODREJCP', 'BSE'),
(35, 18, 1, 'TATAELXSI', 'NSE'),
(35, 18, 1, 'ZOMATO', 'NSE'),
(35, 18, 1, 'NTPC', 'BSE'),
(35, 18, 1, 'JSWSTEEL', 'BSE'),

--For FII/DIIs
(23, 17, 1, 'WIPRO', 'NSE'),
(23, 17, 1, 'LODHA', 'BSE'),
(23, 17, 1, 'HCLTECH', 'NSE'),
(24, 17, 1, 'ICICIBANK', 'NSE'),
(24, 17, 1, 'DRREDDY', 'BSE'),
(33, 17, 1, 'CIPLA', 'NSE'),
(33, 17, 1, 'SUNPHARMA', 'BSE'),
(34, 18, 1, 'LNT', 'NSE'),
(34, 18, 1, 'DLF', 'BSE');

-----------------------------------------------------------------------------------------------------------

INSERT INTO Transaction (
    Transaction_ID, Investor_ID, Broker_ID, Stock_ID, Exchange, Transaction_Type,
    Quantity, Price_At_Transaction, Payment_Method, Transaction_Fee, "Status", Transaction_Time
) VALUES
(1001, 41, 11, 'TCS', 'NSE', 'BUY', 10, 3820.50, 'UPI', 10.00, 'Executed', '2025-03-04 10:01:00'),
(1002, 41, 11, 'INFY', 'NSE', 'BUY', 5, 1472.00, 'Card', 7.50, 'Executed', '2025-03-04 10:03:00'),
(1003, 42, 11, 'RELIANCE', 'BSE', 'BUY', 8, 2730.00, 'NetBanking', 9.00, 'Executed', '2025-03-04 11:30:00'),
(1004, 42, 11, 'RELIANCE', 'BSE', 'SELL', 3, 2735.50, 'UPI', 6.00, 'Executed', '2025-03-05 09:45:00'),
(1005, 43, 11, 'ITC', 'NSE', 'BUY', 20, 428.90, 'Card', 8.50, 'Executed', '2025-03-05 13:00:00'),
(1006, 44, 12, 'DLF', 'NSE', 'BUY', 10, 645.50, 'UPI', 7.20, 'Executed', '2025-03-05 14:15:00'),
(1007, 44, 12, 'DLF', 'NSE', 'BUY', 5, 648.00, 'Card', 6.00, 'Executed', '2025-03-06 10:30:00'),
(1008, 45, 12, 'CIPLA', 'NSE', 'BUY', 7, 1179.50, 'UPI', 8.00, 'Executed', '2025-03-06 11:00:00'),
(1009, 50, 15, 'WIPRO', 'BSE', 'BUY', 15, 444.10, 'NetBanking', 7.50, 'Executed', '2025-03-06 12:00:00'),
(1010, 50, 15, 'WIPRO', 'BSE', 'SELL', 5, 445.00, 'Card', 5.00, 'Executed', '2025-03-07 10:00:00'),

-- BUY transactions
(1011, 43, 11, 'WIPRO', 'NSE', 'BUY', 10, 406.54, 'Card', 12.11, 'Executed', '2025-03-08 09:00:00'),
(1015, 41, 11, 'WIPRO', 'NSE', 'BUY', 6, 1614.59, 'Card', 6.54, 'Executed', '2025-03-08 11:00:00'),
(1026, 46, 13, 'TITAN', 'BSE', 'BUY', 7, 883.96, 'UPI', 9.94, 'Executed', '2025-03-08 16:30:00'),
(1027, 50, 15, 'RELIANCE', 'BSE', 'BUY', 2, 2482.93, 'UPI', 11.39, 'Executed', '2025-03-08 17:00:00'),
(1028, 45, 12, 'DLF', 'NSE', 'BUY', 9, 684.14, 'Card', 5.8, 'Executed', '2025-03-08 17:30:00'),

-- SELL transactions with Edge Cases
(1012, 47, 13, 'INFY', 'NSE', 'SELL', 8, 2888.35, 'Card', 5.34, 'Executed', '2025-03-08 09:30:00'), -- Edge Case: Selling more than held
(1013, 49, 14, 'CIPLA', 'BSE', 'SELL', 9, 703.66, 'Card', 7.83, 'Executed', '2025-03-08 10:00:00'), -- Edge Case
(1014, 45, 12, 'WIPRO', 'BSE', 'SELL', 10, 2605.20, 'NetBanking', 5.04, 'Executed', '2025-03-08 10:30:00'), -- Edge Case
(1029, 48, 14, 'CIPLA', 'BSE', 'SELL', 8, 2674.82, 'NetBanking', 9.48, 'Executed', '2025-03-08 18:00:00'), -- Edge Case
(1030, 49, 14, 'PAYTM', 'NSE', 'SELL', 1, 1538.64, 'Card', 11.19, 'Executed', '2025-03-08 18:30:00'); -- Edge Case

-----------------------------------------------------------------------------------------------------------

INSERT INTO Portfolio (Investor_ID, Broker_ID, Stock_ID, Exchange, Qty_Held, Avg_Buy_Price, Last_Updated)
VALUES (41, 11, 'TCS', 'NSE', 10, 3820.50, '2025-03-04 10:01:00'),
(41, 11, 'INFY', 'NSE', 5, 1472.00, '2025-03-04 10:03:00'),
(42, 11, 'RELIANCE', 'BSE', 5, 2730.00, '2025-03-05 09:45:00'),
(43, 11, 'ITC', 'NSE', 20, 428.90, '2025-03-05 13:00:00'),
(44, 12, 'DLF', 'NSE', 15, 646.33, '2025-03-06 10:30:00'),
(45, 12, 'CIPLA', 'NSE', 7, 1179.50, '2025-03-06 11:00:00'),
(50, 15, 'WIPRO', 'BSE', 10, 444.10, '2025-03-07 10:00:00'),
(43, 11, 'WIPRO', 'NSE', 10, 406.54, '2025-03-08 09:00:00'),
(46, 13, 'TITAN', 'BSE', 7, 883.96, '2025-03-08 16:30:00'),
(50, 15, 'RELIANCE', 'BSE', 2, 2482.93, '2025-03-08 17:00:00'),
(45, 12, 'DLF', 'NSE', 9, 684.14, '2025-03-08 17:30:00'),
(44, 12, 'SUNPHARMA', 'NSE', 3, 1102.75, '2025-03-09 13:30:00'),     
(42, 11, 'TCS', 'NSE', 2, 3810.00, '2025-03-09 12:30:00'),          
(44, 12, 'AXISBANK', 'NSE', 4, 1048.60, '2025-03-09 10:00:00'),
(47, 13, 'ONGC', 'NSE', 10, 186.20, '2025-03-09 11:15:00'),
(41, 11, 'WIPRO', 'NSE', 3, 1614.59, '2025-03-09 13:00:00'),
(21, 16, 'RELIANCE', 'NSE', 100, 2720.50, '2025-03-10 09:10:00'),
(22, 16, 'HDFCBANK', 'BSE', 70, 1610.00, '2025-03-10 09:25:00'),
(31, 16, 'NTPC', 'NSE', 200, 321.00, '2025-03-10 10:00:00'),
(23, 17, 'SUNPHARMA', 'NSE', 120, 1104.50, '2025-03-10 11:00:00'),    
(21, 16, 'JSWSTEEL', 'NSE', 500, 855.90, '2025-03-06 10:30:00'),
(31, 16, 'BAJAJHFL', 'BSE', 600, 519.40, '2025-03-06 11:05:00'),
(44, 12, 'MARUTI', 'BSE', 70, 10600.50, '2025-03-06 13:00:00'),
(22, 16, 'RELIANCE', 'NSE', 150, 2725.10, '2025-03-06 13:30:00'),
(33, 17, 'TITAN', 'NSE', 0, 0.00, '2025-03-06 14:10:00'),
(47, 13, 'WIPRO', 'BSE', 120, 443.80, '2025-03-06 15:00:00'),
(45, 12, 'HCLTECH', 'NSE', 70, 1450.00, '2025-03-06 15:30:00'),
(35, 18, 'PAYTM', 'BSE', 250, 448.70, '2025-03-06 16:00:00');

-- BUY Transactions
INSERT INTO Transaction VALUES
(1031, 44, 12, 'SUNPHARMA', 'NSE', 'BUY', 5, 1102.75, 'UPI', 4.10, 'Executed', '2025-03-09 09:15:00'),
(1032, 42, 11, 'TCS', 'NSE', 'BUY', 3, 3810.00, 'NetBanking', 6.90, 'Executed', '2025-03-09 09:30:00'),
(1033, 44, 12, 'AXISBANK', 'NSE', 'BUY', 4, 1048.60, 'UPI', 3.85, 'Executed', '2025-03-09 10:00:00'),
(1034, 43, 11, 'ZOMATO', 'BSE', 'BUY', 25, 139.00, 'Card', 2.50, 'Executed', '2025-03-09 10:45:00'),
(1035, 47, 13, 'ONGC', 'NSE', 'BUY', 10, 186.20, 'NetBanking', 1.60, 'Executed', '2025-03-09 11:15:00'),

-- SELL Transactions 
INSERT INTO Transaction VALUES
(1036, 48, 14, 'PAYTM', 'BSE', 'SELL', 2, 445.00, 'UPI', 0.80, 'Executed', '2025-03-09 12:00:00'),  
(1037, 42, 11, 'TCS', 'NSE', 'SELL', 1, 3840.00, 'Card', 1.10, 'Executed', '2025-03-09 12:30:00'),   
(1038, 41, 11, 'WIPRO', 'NSE', 'SELL', 3, 440.00, 'UPI', 0.90, 'Executed', '2025-03-09 13:00:00'),   
(1039, 44, 12, 'SUNPHARMA', 'NSE', 'SELL', 2, 1100.00, 'NetBanking', 1.20, 'Executed', '2025-03-09 13:30:00'), 
(1040, 43, 11, 'ZOMATO', 'BSE', 'SELL', 25, 140.00, 'UPI', 2.20, 'Executed', '2025-03-09 14:00:00');

INSERT INTO Transaction VALUES
(1041, 21, 16, 'RELIANCE', 'NSE', 'BUY', 100, 2720.50, 'SWIFT', 120.00, 'Executed', '2025-03-10 09:10:00'),
(1042, 22, 16, 'HDFCBANK', 'BSE', 'SELL', 50, 1620.00, 'SWIFT', 80.00, 'Executed', '2025-03-10 09:25:00'),
(1043, 31, 16, 'NTPC', 'NSE', 'BUY', 200, 321.00, 'RTGS', 150.00, 'Executed', '2025-03-10 10:00:00'),
(1044, 32, 16, 'ICICIBANK', 'BSE', 'SELL', 100, 983.00, 'NEFT', 100.00, 'Executed', '2025-03-10 10:30:00'),
(1045, 23, 17, 'SUNPHARMA', 'NSE', 'BUY', 120, 1104.50, 'SWIFT', 130.00, 'Executed', '2025-03-10 11:00:00'); 
(41, 21, 16, 'JSWSTEEL', 'NSE', 'BUY', 500, 855.90, 'Bank Transfer', 40.00, 'Executed', '2025-03-06 10:30:00'),
(42, 31, 16, 'BAJAJHFL', 'BSE', 'BUY', 600, 519.40, 'NEFT', 36.00, 'Executed', '2025-03-06 11:05:00'),
(44, 12, 44, 'MARUTI', 'BSE', 'BUY', 20, 10615.80, 'Credit Card', 50.00, 'Executed', '2025-03-06 13:00:00'),
(45, 22, 16, 'RELIANCE', 'NSE', 'SELL', 150, 2735.40, 'SWIFT', 25.00, 'Executed', '2025-03-06 13:30:00'),
(46, 33, 17, 'TITAN', 'NSE', 'SELL', 100, 3650.20, 'RTGS', 30.00, 'Executed', '2025-03-06 14:10:00'),
(47, 13, 47, 'WIPRO', 'BSE', 'BUY', 120, 443.80, 'Debit Card', 18.00, 'Executed', '2025-03-06 15:00:00'),
(48, 12, 45, 'HCLTECH', 'NSE', 'SELL', 30, 1470.70, 'Bank Transfer', 10.00, 'Executed', '2025-03-06 15:30:00'),
(49, 35, 18, 'PAYTM', 'BSE', 'BUY', 250, 448.70, 'Bank Transfer', 20.00, 'Executed', '2025-03-06 16:00:00');

-----------------------------------------------------------------------------------------------------------

INSERT INTO Block_Deal (deal_id, exchange, deal_type, qty_traded, investor_id, stock_id, trade_price, deal_time) VALUES
(1, 'NSE', 'SELL', 10195, 33, 'TCS', 3840.5, '2025-03-06 08:50:00'),
(2, 'NSE', 'SELL', 7263, 34, 'TCS', 3840.5, '2025-03-06 08:50:00'),
(3, 'NSE', 'BUY', 4160, 41, 'TCS', 3840.5, '2025-03-06 08:50:00'),
(4, 'NSE', 'BUY', 13298, 31, 'TCS', 3840.5, '2025-03-06 08:50:00'),

(5, 'BSE', 'SELL', 6951, 21, 'INFY', 1472.5, '2025-03-06 09:00:00'),
(6, 'BSE', 'SELL', 5806, 31, 'INFY', 1472.5, '2025-03-06 09:00:00'),
(7, 'BSE', 'BUY', 6579, 44, 'INFY', 1472.5, '2025-03-06 09:00:00'),
(8, 'BSE', 'BUY', 6178, 34, 'INFY', 1472.5, '2025-03-06 09:00:00'),

(9, 'NSE', 'SELL', 7751, 32, 'HDFCBANK', 1620.8, '2025-03-06 14:20:00'),
(10, 'NSE', 'SELL', 3460, 35, 'HDFCBANK', 1620.8, '2025-03-06 14:20:00'),
(11, 'NSE', 'BUY', 3632, 31, 'HDFCBANK', 1620.8, '2025-03-06 14:20:00'),
(12, 'NSE', 'BUY', 7579, 23, 'HDFCBANK', 1620.8, '2025-03-06 14:20:00'),

(13, 'BSE', 'SELL', 8117, 44, 'ICICIBANK', 984.2, '2025-03-06 14:03:00'),
(14, 'BSE', 'SELL', 3086, 43, 'ICICIBANK', 984.2, '2025-03-06 14:03:00'),
(15, 'BSE', 'BUY', 5747, 21, 'ICICIBANK', 984.2, '2025-03-06 14:03:00'),
(16, 'BSE', 'BUY', 5456, 24, 'ICICIBANK', 984.2, '2025-03-06 14:03:00'),

(17, 'NSE', 'SELL', 4349, 34, 'SUNPHARMA', 1100.00, '2025-03-06 14:07:35'),
(18, 'NSE', 'SELL', 8384, 35, 'SUNPHARMA', 1100.00, '2025-03-06 14:07:35'),
(19, 'NSE', 'BUY', 8827, 31, 'SUNPHARMA', 1100.00, '2025-03-06 14:07:35'),
(20, 'NSE', 'BUY', 3906, 24, 'SUNPHARMA', 1100.00, '2025-03-06 14:07:35'),

(21, 'BSE', 'SELL', 6200, 44, 'ITC', 428.8, '2025-03-07 08:53:02'),
(22, 'BSE', 'SELL', 5300, 21, 'ITC', 428.8, '2025-03-07 08:53:02'),
(23, 'BSE', 'BUY', 11500, 32, 'ITC', 428.8, '2025-03-07 08:53:02'),

(24, 'NSE', 'SELL', 11000, 36, 'RELIANCE', 2735.4, '2025-03-07 08:59:51'),
(25, 'NSE', 'BUY', 4000, 47, 'RELIANCE', 2735.4, '2025-03-07 08:59:51'),
(26, 'NSE', 'BUY', 7000, 22, 'RELIANCE', 2735.4, '2025-03-07 08:59:51'),

(27, 'BSE', 'SELL', 7500, 23, 'MARUTI', 10615.8, '2025-03-07 14:07:00'),
(28, 'BSE', 'BUY', 7500, 25, 'MARUTI', 10615.8, '2025-03-07 14:07:00'),

(29, 'NSE', 'SELL', 5000, 45, 'CIPLA', 1180.9, '2025-03-07 14:10:00'),
(30, 'NSE', 'SELL', 4000, 50, 'CIPLA', 1180.9, '2025-03-07 14:10:00'),
(31, 'NSE', 'BUY', 9000, 25, 'CIPLA', 1180.9, '2025-03-07 14:10:00');

-----------------------------------------------------------------------------------------------------------

INSERT INTO Stock_Recommandation (Investor_Id, Analyst_Id, Stock_Id, Exchange) VALUES
(21, 2, 'CIPLA', 'BSE'),
(21, 2, 'INFY', 'BSE'),
(21, 2, 'TCS', 'NSE'),
(23, 5, 'TITAN', 'NSE'),
(23, 5, 'ITC', 'BSE'),
(23, 5, 'RELIANCE', 'NSE'),
(23, 7, 'DLF', 'NSE'),
(23, 7, 'MARUTI', 'BSE'),
(24, 1, 'HDFCBANK', 'NSE'),
(24, 1, 'ICICIBANK', 'BSE'),
(24, 1, 'SUNPHARMA', 'NSE'),
(25, 3, 'CIPLA', 'NSE'),
(25, 3, 'INFY', 'BSE'),
(25, 6, 'MARUTI', 'BSE'),
(26, 4, 'ITC', 'BSE'),
(26, 4, 'RELIANCE', 'NSE'),
(26, 4, 'TITAN', 'NSE'),
(27, 2, 'HDFCBANK', 'NSE'),
(27, 2, 'ICICIBANK', 'BSE'),
(27, 2, 'SUNPHARMA', 'NSE'),
(27, 5, 'DLF', 'NSE'),
(27, 5, 'MARUTI', 'BSE'),
(28, 1, 'CIPLA', 'NSE'),
(28, 1, 'INFY', 'BSE'),
(28, 1, 'TITAN', 'NSE'),
(28, 3, 'TITAN', 'NSE'),
(28, 3, 'TCS', 'NSE'),
(28, 3, 'ITC', 'BSE'),
(29, 6, 'RELIANCE', 'NSE'),
(29, 6, 'MARUTI', 'BSE'),
(31, 3, 'HDFCBANK', 'NSE'),
(31, 3, 'ICICIBANK', 'BSE'),
(31, 3, 'SUNPHARMA', 'NSE'),
(31, 3, 'DLF', 'NSE'),
(32, 2, 'MARUTI', 'BSE'),
(32, 2, 'TITAN', 'NSE'),
(32, 5, 'CIPLA', 'NSE'),
(33, 1, 'TCS', 'NSE'),
(33, 1, 'ITC', 'BSE'),
(33, 4, 'RELIANCE', 'NSE'),
(34, 3, 'HDFCBANK', 'NSE'),
(34, 3, 'ICICIBANK', 'BSE'),
(34, 6, 'SUNPHARMA', 'NSE'),
(35, 2, 'DLF', 'NSE'),
(35, 2, 'MARUTI', 'BSE'),
(35, 7, 'CIPLA', 'NSE'),
(36, 1, 'TITAN', 'NSE'),
(36, 1, 'TCS', 'NSE'),
(36, 4, 'ITC', 'BSE'),
(36, 4, 'RELIANCE', 'NSE'),
(37, 3, 'HDFCBANK', 'NSE'),
(37, 3, 'ICICIBANK', 'BSE'),
(37, 3, 'SUNPHARMA', 'NSE'),
(37, 5, 'DLF', 'NSE'),
(37, 5, 'MARUTI', 'BSE'),
(38, 2, 'CIPLA', 'NSE'),
(38, 2, 'TITAN', 'NSE'),
(38, 2, 'TCS', 'NSE'),
(38, 2, 'ITC', 'BSE'),
(38, 6, 'RELIANCE', 'NSE'),
(39, 1, 'HDFCBANK', 'NSE'),
(39, 1, 'ICICIBANK', 'BSE'),
(39, 4, 'SUNPHARMA', 'NSE'),
(1, 41, 'TCS', 'NSE'),
(1, 43, 'INFY', 'BSE'),
(1, 43, 'ITC', 'NSE'),
(2, 41, 'ICICIBANK', 'NSE');
(2, 44, 'SUNPHARMA', 'BSE');
(2, 49, 'ITC', 'NSE');
(3, 42, 'HDFCBANK', 'NSE');
(3, 45, 'BHARTIARTL', 'BSE');
(3, 50, 'DLF', 'NSE');
(4, 42, 'CIPLA', 'NSE');
(4, 45, 'RELIANCE', 'BSE');
(5, 43, 'AXISBANK', 'NSE');
(5, 46, 'LNT', 'BSE');
(5, 50, 'MARUTI', 'NSE');
(6, 43, 'GODREJCP', 'NSE');
(6, 46, 'TATAELXSI', 'BSE');
(6, 49, 'TITAN', 'NSE');
(7, 44, 'ZOMATO', 'NSE');
(7, 47, 'PAYTM', 'BSE');
(8, 45, 'JSWSTEEL', 'NSE');
(8, 47, 'DRREDDY', 'BSE');
(9, 48, 'WIPRO', 'NSE');
(10, 48, 'BAJFINANCE', 'BSE');
(10, 49, 'ICICIGI', 'NSE');
(1, 41, 'NTPC', 'BSE');
(1, 43, 'WIPRO', 'NSE');
(2, 41, 'TITAN', 'BSE');
(2, 44, 'VODAFONE', 'NSE');
(2, 49, 'TATAELXSI', 'BSE');
(3, 42, 'PAYTM', 'NSE');
(3, 45, 'DRREDDY', 'NSE');
(3, 50, 'LODHA', 'BSE');
(4, 42, 'DLF', 'BSE');
(4, 45, 'HCLTECH', 'NSE');
(5, 43, 'ICICIGI', 'BSE');
(5, 46, 'JSWSTEEL', 'NSE');
(5, 50, 'ONGC', 'BSE');
(6, 43, 'INFY', 'NSE');
(6, 46, 'SUNPHARMA', 'BSE');
(6, 49, 'ICICIBANK', 'NSE');
(7, 44, 'RELIANCE', 'NSE');
(7, 47, 'ITC', 'BSE');
(8, 45, 'TCS', 'NSE');
(8, 47, 'HDFCAMC', 'BSE');
(9, 48, 'HCLTECH', 'BSE');
(9, 48, 'NTPC', 'NSE');
(10, 48, 'BAJAJHFL', 'NSE');
(10, 49, 'AXISBANK', 'BSE');

-----------------------------------------------------------------------------------------------------------

INSERT INTO Mutual_Funds (Symbol, Fund_Name, Fund_Manager, Risk_Level, Fund_Type, Expense_Ratio, AUM, NAV, Min_Investment) VALUES
('HDFCEQG', 'HDFC Equity Growth Fund', 'Rakesh Vyas', 'High', 'Equity', 1.35, 18500000000.00, 545.23, 5000.00),
('ICICIDBF', 'ICICI Debt Bond Fund', 'Amit Sharma', 'Low', 'Debt', 0.95, 12200000000.00, 23.78, 1000.00),
('SBIHYBF', 'SBI Hybrid Balanced Fund', 'Priya Nair', 'Medium', 'Hybrid', 1.10, 9400000000.00, 112.60, 1500.00),
('NIPPONIDX', 'Nippon India Nifty 50 Index Fund', 'Kunal Thakkar', 'Medium', 'Index', 0.40, 6700000000.00, 211.32, 500.00),
('MIRAEETF', 'Mirae Asset ETF Fund', 'Rahul Mehta', 'Medium', 'ETF', 0.30, 4000000000.00, 150.45, 100.00),
('KOTAKLIQ', 'Kotak Liquid Fund', 'Manisha Gupta', 'Low', 'Liquid', 0.20, 11000000000.00, 104.80, 1000.00),
('AXISEQFD', 'Axis Bluechip Equity Fund', 'Siddharth Roy', 'High', 'Equity', 1.20, 20800000000.00, 328.60, 5000.00),
('UTIDEBTD', 'UTI Short Term Debt Fund', 'Alok Kumar', 'Low', 'Debt', 0.85, 8900000000.00, 25.10, 1000.00),
('ICICIHYBF', 'ICICI Balanced Advantage Fund', 'Shweta Mishra', 'Medium', 'Hybrid', 1.05, 9800000000.00, 89.75, 2000.00),
('MOTILALOETF', 'Motilal Oswal Nasdaq 100 ETF', 'Kavita Rao', 'High', 'ETF', 0.50, 3500000000.00, 460.85, 100.00),
('SBIIDXF', 'SBI Nifty Next 50 Index Fund', 'Dinesh Shah', 'Medium', 'Index', 0.60, 7200000000.00, 167.40, 1000.00),
('FRANKLINLIQ', 'Franklin India Liquid Fund', 'Rohit Arora', 'Low', 'Liquid', 0.18, 5000000000.00, 102.55, 1000.00),
('HDFCHYBR', 'HDFC Hybrid Equity Fund', 'Ritu Verma', 'Medium', 'Hybrid', 1.10, 7500000000.00, 130.90, 2000.00),
('TATAEQF', 'Tata Large Cap Fund', 'Anand Desai', 'High', 'Equity', 1.25, 16000000000.00, 410.70, 5000.00),
('IDFCDTBF', 'IDFC Corporate Bond Fund', 'Meera Joshi', 'Low', 'Debt', 0.70, 6100000000.00, 27.85, 1000.00);

-----------------------------------------------------------------------------------------------------------

INSERT INTO MF_Carries (MF_Symbol, Stock_ID, Exchange) VALUES
('HDFCEQG', 'INFY', 'BSE'),
('HDFCEQG', 'TCS', 'NSE'),
('HDFCEQG', 'RELIANCE', 'BSE'),

('ICICIDBF', 'HDFCBANK', 'NSE'),
('ICICIDBF', 'ICICIBANK', 'BSE'),

('SBIHYBF', 'ITC', 'NSE'),
('SBIHYBF', 'INFY', 'BSE'),
('SBIHYBF', 'MARUTI', 'NSE'),

('NIPPONIDX', 'RELIANCE', 'NSE'),
('NIPPONIDX', 'INFY', 'NSE'),

('MIRAEETF', 'HDFCBANK', 'BSE'),
('MIRAEETF', 'TCS', 'BSE'),

('KOTAKLIQ', 'HDFCBANK', 'NSE'),

('AXISEQFD', 'BAJFINANCE', 'NSE'),
('AXISEQFD', 'TITAN', 'BSE'),
('AXISEQFD', 'INFY', 'NSE'),

('UTIDEBTD', 'SBI', 'BSE'),
('UTIDEBTD', 'NTPC', 'NSE'),

('ICICIHYBF', 'ICICIBANK', 'NSE'),
('ICICIHYBF', 'RELIANCE', 'NSE'),

('MOTILALOETF', 'TCS', 'NSE'),
('MOTILALOETF', 'INFY', 'NSE'),

('SBIIDXF', 'MARUTI', 'NSE'),
('SBIIDXF', 'RELIANCE', 'BSE'),

('FRANKLINLIQ', 'HDFCBANK', 'NSE'),

('HDFCHYBR', 'ITC', 'BSE'),
('HDFCHYBR', 'RELIANCE', 'BSE'),

('TATAEQF', 'TCS', 'NSE'),
('TATAEQF', 'TITAN', 'BSE'),

('IDFCDTBF', 'NTPC', 'BSE'),
('IDFCDTBF', 'HDFCBANK', 'NSE');

-----------------------------------------------------------------------------------------------------------

INSERT INTO MF_Transaction VALUES
(1, 41, 11, 'SBIHYBF', 'BUY', 50, 120.50, 'Processed', '2025-03-05 10:30:00'),
(2, 42, 12, 'HDFCHYBR', 'SIP', 10, 105.00, 'Processed', '2025-03-05 10:35:00'),
(3, 43, 11, 'ICICIHYBF', 'BUY', 40, 98.75, 'Failed', '2025-03-06 11:00:00'),
(4, 44, 12, 'NIPPONIDX', 'SIP', 15, 205.20, 'Cancelled', '2025-03-06 12:15:00'),
(5, 45, 12, 'AXISEQFD', 'BUY', 20, 55.30, 'Processed', '2025-03-07 09:50:00'),
(6, 46, 13, 'SBIHYBF', 'SELL', 10, 123.40, 'Processed', '2025-03-08 14:10:00'),
(7, 47, 13, 'HDFCHYBR', 'SIP', 5, 106.10, 'Processed', '2025-03-08 15:00:00'),
(8, 48, 14, 'ICICIHYBF', 'BUY', 30, 97.60, 'Pending', '2025-03-09 13:25:00'),
(9, 49, 14, 'NIPPONIDX', 'BUY', 25, 207.50, 'Processed', '2025-03-10 16:40:00'),
(10, 50, 15, 'AXISEQFD', 'SELL', 5, 56.00, 'Processed', '2025-03-10 17:05:00');

-----------------------------------------------------------------------------------------------------------

INSERT INTO MF_Portfolio VALUES
(42, 12, 'HDFCHYBR', 10, 105.00, '2025-03-05 10:35:00'),
(46, 13, 'SBIHYBF', 10, 123.40, '2025-03-08 14:10:00'),
(47, 13, 'HDFCHYBR', 5, 106.10, '2025-03-08 15:00:00'),
(49, 14, 'NIPPONIDX', 25, 207.50, '2025-03-10 16:40:00'),
(50, 15, 'AXISEQFD', 5, 56.00, '2025-03-10 17:05:00');

-----------------------------------------------------------------------------------------------------------

INSERT INTO MF_Transaction VALUES
(11, 41, 11, 'SBIHYBF', 'SIP', 10, 121.00, 'Processed', '2025-03-15 10:00:00'),
(12, 41, 12, 'SBIHYBF', 'BUY', 20, 122.00, 'Processed', '2025-03-16 11:30:00'),
(13, 45, 12, 'AXISEQFD', 'SELL', 10, 57.00, 'Processed', '2025-03-17 13:00:00'),
(14, 42, 11, 'ICICIHYBF', 'SIP', 15, 99.00, 'Processed', '2025-03-18 09:45:00'),
(15, 31, 16, 'NIPPONIDX', 'BUY', 1000, 210.00, 'Processed', '2025-03-18 14:30:00'),
(16, 32, 16, 'HDFCHYBR', 'SIP', 800, 107.00, 'Processed', '2025-03-19 12:00:00'),
(17, 44, 12, 'NIPPONIDX', 'SELL', 5, 208.00, 'Processed', '2025-03-20 11:15:00'),
(18, 45, 13, 'HDFCHYBR', 'SIP', 10, 106.00, 'Cancelled', '2025-03-20 15:30:00'),
(19, 49, 14, 'SBIHYBF', 'BUY', 25, 123.50, 'Failed', '2025-03-21 10:45:00'),
(20, 43, 11, 'ICICIHYBF', 'SIP', 12, 97.90, 'Pending', '2025-03-21 11:55:00');

-----------------------------------------------------------------------------------------------------------

INSERT INTO MF_Portfolio VALUES
(41, 11, 'SBIHYBF', 10, 121.00, '2025-03-15 10:00:00'),
(41, 12, 'SBIHYBF', 20, 122.00, '2025-03-16 11:30:00'),
(45, 12, 'AXISEQFD', 10, 57.00, '2025-03-17 13:00:00'),
(42, 11, 'ICICIHYBF', 15, 99.00, '2025-03-18 09:45:00'),
(31, 16, 'NIPPONIDX', 1000, 210.00, '2025-03-18 14:30:00'),
(32, 16, 'HDFCHYBR', 800, 107.00, '2025-03-19 12:00:00'),
(44, 12, 'NIPPONIDX', 5, 208.00, '2025-03-20 11:15:00');

-----------------------------------------------------------------------------------------------------------

INSERT INTO News (Sector_Name, News_Title, "Date", "Description") VALUES
('Information Technology', 'AI Revolution Driving Tech Stocks', '2025-03-05', 'The rapid adoption of AI tools has led to a surge in demand for cloud and semiconductor companies.'),
('Information Technology', 'IT Services See Offshore Boom', '2025-03-07', 'Indian IT firms report increased outsourcing deals from US and Europe, boosting sector growth.'),

('Finance', 'RBI Hints at Rate Pause', '2025-03-06', 'The Reserve Bank of India signaled a potential pause in interest rate hikes, boosting banking stocks.'),
('Finance', 'Fintech Firms Under Regulatory Lens', '2025-03-08', 'SEBI and RBI are considering tighter norms for digital lending platforms amid rising fraud cases.'),

('Healthcare', 'Healthcare Sector Gains from Budget Push', '2025-03-03', 'Union Budget allocates more funds for rural health infrastructure, positively impacting pharma and hospital chains.'),
('Healthcare', 'Medical Devices to Be Made in India', '2025-03-09', 'Govt announces incentive scheme to boost domestic manufacturing of medical equipment.'),

('Consumer Goods', 'FMCG Companies Face Margin Pressure', '2025-03-05', 'Rising raw material costs squeeze margins for leading FMCG brands.'),
('Consumer Goods', 'Demand Rises in Rural Markets', '2025-03-07', 'Rural demand recovery seen in Q1, aiding volume growth for consumer staples.'),

('Energy', 'Crude Prices Surge Amid Tensions', '2025-03-04', 'Oil prices spike due to geopolitical unrest, raising concerns for downstream companies.'),
('Energy', 'India Boosts Renewable Energy Capacity', '2025-03-08', 'India adds record solar and wind capacity in Q1 2025, aiding clean energy firms.'),

('Telecommunications', '5G Expansion Across Tier-2 Cities', '2025-03-06', 'Telcos roll out 5G services in more cities, driving data consumption and ARPU.'),
('Telecommunications', 'TRAI Plans Tariff Floor', '2025-03-09', 'Telecom regulator may introduce tariff floor to ensure sector profitability.'),

('Automobile', 'EV Sales Hit Record High', '2025-03-05', 'Electric vehicle sales grew 40% YoY in February, led by two-wheeler makers.'),
('Automobile', 'Auto Exports Recover in Q1', '2025-03-07', 'Strong demand from Latin America boosts auto exports, especially passenger vehicles.'),

('Infrastructure', 'Infra Spending Jumps 30% in Budget', '2025-03-03', 'Massive infrastructure outlay announced in Budget to boost roads, ports, and metro projects.'),
('Infrastructure', 'Railway Modernization Gets Green Light', '2025-03-06', 'Govt clears ₹2L crore plan for railway electrification and new routes.'),

('Pharmaceuticals', 'New Drug Approvals Drive Pharma Rally', '2025-03-04', 'USFDA nods for new generics push Indian pharma stocks up.'),
('Pharmaceuticals', 'Export Orders from Africa Surge', '2025-03-08', 'Indian drugmakers secure large export contracts from African markets.'),

('Real Estate', 'Housing Demand Up in Metro Cities', '2025-03-07', 'Lower interest rates and better job sentiment push residential demand.'),
('Real Estate', 'Affordable Housing Gets Budget Push', '2025-03-05', 'Govt extends PMAY subsidies and tax breaks for affordable housing sector.'),

('Industrials', 'Capex Cycle Revival Evident', '2025-03-06', 'Private and public investment in capital goods surges in Q1 2025.'),
('Industrials', 'Machinery Orders Up 25%', '2025-03-09', 'Order books of capital goods companies fill up due to infra boost.'),

('Materials', 'Steel Prices Stabilize After Spike', '2025-03-04', 'After weeks of volatility, steel prices show signs of cooling off.'),
('Materials', 'Cement Firms Report Higher Volume Growth', '2025-03-08', 'Construction boom drives demand for cement across regions.');