CREATE SCHEMA INVESTHUB;
SET SEARCH_PATH TO INVESTHUB;

CREATE TABLE User_Info(
    Email VARCHAR(100) PRIMARY KEY,
    PAN_No CHAR(10) NOT NULL,
    fname VARCHAR(50) NOT NULL,
    mname VARCHAR(50),
    lname VARCHAR(50),
    Country VARCHAR(50) NOT NULL
);

CREATE TABLE "User"(
    User_ID INTEGER PRIMARY KEY,
    Email VARCHAR(100) NOT NULL,
    Registered_At DATE NOT NULL,
    User_Type VARCHAR(20) NOT NULL CHECK (User_Type IN ('Investor', 'Broker','Analyst')),
    FOREIGN KEY (Email) REFERENCES User_Info(Email) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Address(
    User_ID INTEGER,
    "Address" TEXT,
    PRIMARY KEY(User_ID,"Address"),
    FOREIGN KEY(User_ID) REFERENCES "User"(User_ID) ON DELETE CASCADE
);

CREATE TABLE Phone_No(
    User_ID INTEGER,
    Phone_No VARCHAR(15), 
    PRIMARY KEY(User_ID,Phone_No),
    FOREIGN KEY(User_ID) REFERENCES "User"(User_ID) ON DELETE CASCADE
);


CREATE TABLE Analyst(
    Analyst_ID INTEGER PRIMARY KEY,
    Reg_No CHAR(12) NOT NULL UNIQUE,
    Experiance INTEGER NOT NULL,
    FOREIGN KEY (Analyst_ID) REFERENCES "User"(User_ID) ON DELETE CASCADE
);


CREATE TABLE Broker(
    Broker_ID INTEGER PRIMARY KEY,
    -- Official license number of the broker, must be unique
    Broker_Licence_No CHAR(14) NOT NULL UNIQUE,
    Firm_Name VARCHAR(50) NOT NULL,
    Experiance_Years INTEGER NOT NULL,
     -- Standard commission rate charged by the broker (potentially variable)
    Commision_Rate DECIMAL(3,2),
    FOREIGN KEY(Broker_ID) REFERENCES "User"(User_ID) ON DELETE CASCADE
);

CREATE TABLE Investor(
    Investor_ID INTEGER PRIMARY KEY,
    Investor_Type VARCHAR(20) NOT NULL CHECK (Investor_Type IN ('FII', 'DII','Retail_Investor')),
    FOREIGN KEY (Investor_ID) REFERENCES "User"(User_ID) ON DELETE CASCADE
);

CREATE TABLE Sector(
    Sector_Name VARCHAR(50) PRIMARY KEY,
    Sector_Size INTEGER NOT NULL
);

CREATE TABLE DII(
    DII_ID INTEGER PRIMARY KEY,
    Reg_No CHAR(14) NOT NULL UNIQUE,
    Category VARCHAR(20) NOT NULL,
    Investment_Sector VARCHAR(20) NOT NULL,
    Total_Investment INTEGER NOT NULL,
    FOREIGN KEY (DII_ID) REFERENCES Investor(Investor_ID) ON DELETE CASCADE,
    FOREIGN KEY (Investment_Sector) REFERENCES Sector(Sector_Name) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE FII(
    FII_ID INTEGER PRIMARY KEY,
    Reg_No CHAR(14) NOT NULL UNIQUE,
    Investment_Sector VARCHAR(20) NOT NULL,
    Total_Investment INTEGER NOT NULL,
    FOREIGN KEY (FII_ID) REFERENCES Investor(Investor_ID) ON DELETE CASCADE,
    FOREIGN KEY (Investment_Sector) REFERENCES Sector(Sector_Name) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Retail_Investor(
    Investor_ID INTEGER PRIMARY KEY,
    DOB DATE NOT NULL,
    Account_Balance FLOAT(20) NOT NULL,
    FOREIGN KEY (Investor_ID) REFERENCES Investor(Investor_ID) ON DELETE CASCADE
);

CREATE TABLE Follows(
    Analyst_ID INTEGER,
    Investor_ID INTEGER,
    PRIMARY KEY(Analyst_ID,Investor_ID),
    FOREIGN KEY (Investor_ID) REFERENCES Investor(Investor_ID) ON DELETE CASCADE,
    FOREIGN KEY (Analyst_ID) REFERENCES Analyst(Analyst_ID) ON DELETE CASCADE
);

CREATE TABLE Provides_Platform_To(
    Broker_ID INTEGER,
    Investor_ID INTEGER,
    PRIMARY KEY(Broker_ID,Investor_ID),
    FOREIGN KEY(Broker_ID) REFERENCES Broker(Broker_ID) ON DELETE CASCADE,
    FOREIGN KEY(Investor_ID) REFERENCES Investor(Investor_ID) ON DELETE CASCADE
);

CREATE TABLE News(
    Sector_Name VARCHAR(50),
    News_Title VARCHAR(100),
    "Date" DATE ,
    "Description" TEXT NOT NULL,
    PRIMARY KEY(Sector_Name,News_Title,"Date"),
    FOREIGN KEY (Sector_Name) REFERENCES Sector(Sector_Name) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Industry(
    Industry_Name VARCHAR(50) PRIMARY KEY,
    Sector_Name VARCHAR(50) NOT NULL,
    FOREIGN KEY (Sector_Name) REFERENCES Sector(Sector_Name) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE Company(
    Company_Name VARCHAR(50) PRIMARY KEY,
    CEO VARCHAR(50) NOT NULL,
    Founded_Year CHAR(4) NOT NULL,
    Industry_Name VARCHAR(50) NOT NULL,
    Headquarter VARCHAR(50) NOT NULL,
    Total_Shares BIGINT NOT NULL,
    -- Net Revenue for the latest quarter
    NR_QTR DECIMAL(20,2) NOT NULL,
     -- Gross Profit for the latest quarter
    Gross_QTR_Profit DECIMAL(20,2) NOT NULL,
    -- Earnings Per Share
    EPS FLOAT(10) NOT NULL,
    FOREIGN KEY (Industry_Name) REFERENCES Industry(Industry_Name) ON DELETE RESTRICT ON UPDATE CASCADE
);


CREATE TABLE IPO(
    Symbol VARCHAR(50) PRIMARY KEY,
    Company_Name VARCHAR(50) NOT NULL UNIQUE,
    Open_Date DATE NOT NULL,
    Close_Date DATE NOT NULL,
    -- Total size of the IPO issue in currency units or shares
    Issue_Size BIGINT NOT NULL,
     -- Price per share for the IPO
    Issue_Price DECIMAL(10,2) NOT NULL,
    -- Minimum number of shares an investor must apply for
    Lot_Size INTEGER NOT NULL,
    Exchange CHAR(3) NOT NULL CHECK (Exchange IN ('BSE', 'NSE')),
    IPO_Type VARCHAR(10) NOT NULL CHECK (IPO_Type IN ('SME', 'MAIN_BOARD')),
    "Status" VARCHAR(10) NOT NULL CHECK ("Status" IN ('Closed', 'Listed','Ongoing','Upcoming')),
    Listing_Date DATE NOT NULL,
    Listing_Price DECIMAL(10,2),
    -- Final Grey Market Premium before listing
    Final_GMP DECIMAL(5,2),
    FOREIGN KEY (Company_Name) REFERENCES Company(Company_Name) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Stock_Info(
    Stock_ID VARCHAR(50) PRIMARY KEY,
    Stock_Name VARCHAR(50),
    Company_Name VARCHAR(50),
    FOREIGN KEY (Company_Name) REFERENCES Company(Company_Name) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE Stock_Pricing(
    Stock_ID VARCHAR(50),
    Exchange CHAR(3) NOT NULL CHECK (Exchange IN ('BSE', 'NSE')),
    Current_Price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (Stock_ID,Exchange),
    FOREIGN KEY (Stock_ID) REFERENCES Stock_Info(Stock_ID) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE Dividend(
    Stock_ID VARCHAR(50),
    Exchange CHAR(3) NOT NULL CHECK (Exchange IN ('BSE', 'NSE')),
    Payment_Date DATE NOT NULL,
    Dividend_Amount FLOAT(7),
    -- Method of payment (e.g., Cash, Stock)
    Payment_Method VARCHAR(50) NOT NULL CHECK (Payment_Method IN ('Cash', 'Stock')),
    PRIMARY KEY(Stock_ID,Exchange,Payment_Date),
    FOREIGN KEY (Stock_ID,Exchange) REFERENCES Stock_Pricing(Stock_ID,Exchange) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Trend(
    Stock_ID VARCHAR(50),
    Exchange CHAR(3) NOT NULL CHECK (Exchange IN ('BSE', 'NSE')),
    "Date" DATE,
    Open_Price DECIMAL(10,2) NOT NULL,
    Close_Price DECIMAL(10,2) NOT NULL,
    High_Price DECIMAL(10,2) NOT NULL,
    Low_Price DECIMAL(10,2) NOT NULL,
     -- Number of shares traded on that date
    Volume BIGINT NOT NULL,
    Year_High DECIMAL(10,2) NOT NULL,
    Year_Low DECIMAL(10,2) NOT NULL,
    -- Price-to-Earnings ratio as of this date
    PE_Ratio DECIMAL(8,2) NOT NULL,
     -- Market capitalization as of this date (Current_Price * Total_Shares)
    Market_Cap DECIMAL(20,2) NOT NULL,
    PRIMARY KEY (Stock_ID,Exchange,"Date"),
    FOREIGN KEY (Stock_ID,Exchange) REFERENCES Stock_Pricing(Stock_ID,Exchange) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE Block_Deals(
    Deal_ID INTEGER PRIMARY KEY,
    Exchange CHAR(3) NOT NULL CHECK (Exchange IN ('BSE', 'NSE')),
    Deal_Type VARCHAR(4) NOT NULL CHECK (Deal_Type IN ('BUY', 'SELL')),
    Qty_Traded INTEGER NOT NULL,
    Investor_ID INTEGER NOT NULL,
    Stock_ID VARCHAR(50) NOT NULL,
    Trade_Price FLOAT(10) NOT NULL,
    Deal_Time TIMESTAMP NOT NULL,
    UNIQUE(Investor_ID,Stock_ID,Exchange,Deal_Time),
    FOREIGN KEY (Investor_ID) REFERENCES Investor(Investor_ID) ON DELETE CASCADE,
    FOREIGN KEY (Stock_ID,Exchange) REFERENCES Stock_Pricing(Stock_ID,Exchange) ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE Stock_Recommandation(
    Analyst_ID INTEGER,
    Investor_ID INTEGER,
    Stock_ID VARCHAR(50),
    Exchange CHAR(3) CHECK (Exchange IN ('BSE', 'NSE')),
    PRIMARY KEY(Analyst_ID,Investor_ID,Stock_ID,Exchange),
    FOREIGN KEY (Analyst_ID,Investor_ID) REFERENCES Follows(Analyst_ID,Investor_ID) ON DELETE CASCADE,
    FOREIGN KEY (Stock_ID,Exchange) REFERENCES Stock_Pricing(Stock_ID,Exchange) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Watchlist(
    Investor_ID INTEGER,
    Broker_ID INTEGER,
    Watchlist_ID INTEGER,
    "Name" VARCHAR(50),
    -- Date the watchlist was created
    Added_On DATE NOT NULL,
    PRIMARY KEY (Investor_ID,Broker_ID,Watchlist_ID),
    FOREIGN KEY (Broker_ID,Investor_ID) REFERENCES Provides_Platform_To(Broker_ID,Investor_ID) ON DELETE CASCADE
);

CREATE TABLE WL_Contains(
    Investor_ID INTEGER,
    Broker_ID INTEGER,
    Watchlist_ID INTEGER,
    Stock_ID VARCHAR(50),
    Exchange CHAR(3) NOT NULL CHECK (Exchange IN ('BSE', 'NSE')),
    PRIMARY KEY(Investor_ID,Broker_ID,Watchlist_ID,Stock_ID,Exchange),
    FOREIGN KEY(Investor_ID,Broker_ID,Watchlist_ID) REFERENCES Watchlist(Investor_ID,Broker_ID,Watchlist_ID) ON DELETE CASCADE,
    FOREIGN KEY(Stock_ID,Exchange) REFERENCES Stock_Pricing(Stock_ID,Exchange) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Portfolio(
    Investor_ID INTEGER,
    Broker_ID INTEGER,
    Stock_ID VARCHAR(50),
    Exchange CHAR(3) NOT NULL CHECK (Exchange IN ('BSE', 'NSE')),
    Qty_Held INTEGER NOT NULL,
    Avg_Buy_Price DECIMAL(10,2) NOT NULL,
    Last_Updated TIMESTAMP NOT NULL,
    PRIMARY KEY(Investor_ID,Broker_ID,Stock_ID,Exchange),
    FOREIGN KEY(Broker_ID,Investor_ID) REFERENCES Provides_Platform_To(Broker_ID,Investor_ID) ON DELETE CASCADE,
    FOREIGN KEY(Stock_ID,Exchange) REFERENCES Stock_Pricing(Stock_ID,Exchange) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Transaction(
    Transaction_ID INTEGER PRIMARY KEY,
    Investor_ID INTEGER NOT NULL,
    Broker_ID INTEGER NOT NULL,
    Stock_ID VARCHAR(50) NOT NULL,
    Exchange CHAR(3) NOT NULL CHECK (Exchange IN ('BSE', 'NSE')),
    Transaction_Type VARCHAR(4) NOT NULL CHECK (Transaction_Type IN ('BUY','SELL')),
    Quantity INTEGER NOT NULL,
    Price_At_Transaction DECIMAL(10,2) NOT NULL,
    Payment_Method VARCHAR(20) NOT NULL,
    Transaction_Fee DECIMAL(10,2) NOT NULL,
    "Status" VARCHAR(10) NOT NULL CHECK ("Status" IN ('Executed', 'Pending', 'Failed', 'Cancelled')),
    Transaction_Time TIMESTAMP NOT NULL,
    UNIQUE(Investor_ID,Broker_ID,Transaction_Time,Stock_ID,Exchange),
    FOREIGN KEY(Broker_ID,Investor_ID) REFERENCES Provides_Platform_To(Broker_ID,Investor_ID) ON DELETE CASCADE,
    FOREIGN KEY(Stock_ID,Exchange) REFERENCES Stock_Pricing(Stock_ID,Exchange) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Mutual_Funds(
    Symbol VARCHAR(50) PRIMARY KEY,
    Fund_Name VARCHAR(50) NOT NULL,
    Fund_Manager VARCHAR(50) NOT NULL,
    Risk_Level VARCHAR(10) NOT NULL CHECK (Risk_Level IN ('Low','Medium','High')),
    Fund_Type VARCHAR(20) NOT NULL CHECK (Fund_Type IN ('Equity', 'Debt','Hybrid','Index','ETF','Liquid')),
    -- Annual fee charged by the fund (as a percentage)
    Expense_Ratio DECIMAL(5,2) NOT NULL,
    -- Assets Under Management (total value of assets held by the fund)
    AUM DECIMAL(20,2) NOT NULL,
    -- Net Asset Value per unit of the fund
    NAV DECIMAL(10,2) NOT NULL,
    -- Minimum amount required for initial investment
    Min_Investment DECIMAL(10,2) NOT NULL
);

CREATE TABLE MF_Carries(
    MF_Symbol VARCHAR(50),
    Stock_ID VARCHAR(50),
    Exchange CHAR(3) NOT NULL CHECK (Exchange IN ('BSE', 'NSE')),
    PRIMARY KEY(MF_Symbol,Stock_ID,Exchange),
    FOREIGN KEY(MF_Symbol) REFERENCES Mutual_Funds(Symbol) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(Stock_ID,Exchange) REFERENCES Stock_Pricing(Stock_ID,Exchange) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE MF_Portfolio(
    Investor_ID INTEGER,
    Broker_ID INTEGER,
    MF_Symbol VARCHAR(50),
    -- Number of units of the mutual fund currently held
    Units_Held INTEGER,
     -- Average NAV at which the held units were acquired
    Avg_Buy_NAV DECIMAL(10,2) NOT NULL,
    Last_Updated TIMESTAMP NOT NULL,
    PRIMARY KEY(Investor_ID,Broker_ID,MF_Symbol),
    FOREIGN KEY(MF_Symbol) REFERENCES Mutual_Funds(Symbol) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY(Broker_ID,Investor_ID) REFERENCES Provides_Platform_To(Broker_ID,Investor_ID) ON DELETE CASCADE
);

CREATE TABLE MF_Transaction(
    Transaction_ID INTEGER PRIMARY KEY,
    Investor_ID INTEGER NOT NULL,
    Broker_ID INTEGER NOT NULL,
    MF_Symbol VARCHAR(50) NOT NULL,
    Transaction_Type VARCHAR(4) NOT NULL CHECK (Transaction_Type IN ('BUY', 'SELL', 'SIP')),
    Units INTEGER NOT NULL,
    Price_At_Transaction DECIMAL(10,2) NOT NULL,
    "Status" VARCHAR(10) NOT NULL CHECK ("Status" IN ('Processed', 'Pending', 'Failed', 'Cancelled')),
    Transaction_Time TIMESTAMP NOT NULL,
    UNIQUE(Investor_ID,Broker_ID,Transaction_Time,MF_Symbol),
    FOREIGN KEY(Broker_ID,Investor_ID) REFERENCES Provides_Platform_To(Broker_ID,Investor_ID) ON DELETE CASCADE,
    FOREIGN KEY(MF_Symbol) REFERENCES Mutual_Funds(Symbol) ON DELETE CASCADE ON UPDATE CASCADE
);