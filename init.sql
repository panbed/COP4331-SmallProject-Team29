CREATE DATABASE COP4331;
USE COP4331;

CREATE TABLE `COP4331`.`Users` ( 
	`ID` INT NOT NULL AUTO_INCREMENT , 
	`DateCreated` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	`DateLastLoggedIn` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP , 
	`FirstName` VARCHAR(50) NOT NULL DEFAULT '' , 
	`LastName` VARCHAR(50) NOT NULL DEFAULT '' , 
	`Login` VARCHAR(50) NOT NULL DEFAULT '' , 
	`Password` VARCHAR(50) NOT NULL DEFAULT '' , 
	PRIMARY KEY (`ID`)
) ENGINE = InnoDB;

CREATE TABLE `COP4331`.`Contacts` ( 
	`ID` INT NOT NULL AUTO_INCREMENT , 
	`Name` VARCHAR(50) NOT NULL DEFAULT '' , 
	`Phone` VARCHAR(50) NOT NULL DEFAULT '' , 
	`Email` VARCHAR(50) NOT NULL DEFAULT '' , 
	`UserID` INT NOT NULL DEFAULT '0' , 
	PRIMARY KEY (`ID`)
) ENGINE = InnoDB;

-- Create user used to connect with database from the outside, and grant permissions
USE COP4331;
CREATE USER 'TheBeast' IDENTIFIED BY 'WeLoveCOP4331';
GRANT ALL PRIVILEGES ON COP4331.* to 'TheBeast'@'%';

-- Create test data (for development purposes only)!
INSERT INTO Users (FirstName,LastName,Login,Password) VALUES ('Rick','Leinecker','RickL','COP4331');

