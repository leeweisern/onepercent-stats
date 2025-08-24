PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO account VALUES('Bgr7BWSQrTrRlZfO43J79GEWBZNOi2Pd','signatureonepercent2025@gmail.com','credential','Lr8ttj1v3dfolGoexjvT5GDDA5CWCXax',NULL,NULL,NULL,NULL,NULL,NULL,'ab3e44f8b5353b63627004d18fee7790:bdf1e8298bef179bb3653270f2f96eb55de57a9397bf080ee16eb29208e2f714ae0be8c85c0c49c002f25a92b9bb3e515b4879112c806b7a70142412e648d688',2025-08-03T16:11:09.526Z,2025-08-03T16:11:09.526Z);
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
INSERT INTO session VALUES('998aY02OAzwlzMyyLYrP4p70fImPP0Dw',1754973135,'3Sh11MEkIOz4rjfSU9yGeeLQY8Z1CfyM',1754243205,1754368335,'','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36','Lr8ttj1v3dfolGoexjvT5GDDA5CWCXax');
INSERT INTO session VALUES('d2uYydNB8plEMKXmuF9OAy43MpWvbyTf',1756126741,'wevhTKc0QMkxG5Rxdg7Th3gAL28iL8AL',1754282963,1755521941,'','Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1','Lr8ttj1v3dfolGoexjvT5GDDA5CWCXax');
INSERT INTO session VALUES('rRPULuw87lDLBw5LBC1indnQ1KDyy85q',1755408789,'rifPC3VNqPvfR17lBPnV1CpztZiCV3gF',1754293800,1754803989,'','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0','Lr8ttj1v3dfolGoexjvT5GDDA5CWCXax');
INSERT INTO session VALUES('OTbgHYXZPOrduiOdiNzShnPk7SBeGglL',1754973120,'Myci11cO9xzduc9lVlHLAyHhxYDpONm7',1754368320,1754368320,'','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36','Lr8ttj1v3dfolGoexjvT5GDDA5CWCXax');
INSERT INTO session VALUES('MdkMaeyHeiMz05WRKvnbBUkEgIo6xNyb',1756476103,'YrtTh8zxtz1t4vaPfNDbhxyMmjUGwGlb',1755485437,1755871303,'','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','Lr8ttj1v3dfolGoexjvT5GDDA5CWCXax');
INSERT INTO session VALUES('sOUdBJV3d6TnXmtnsTNmXbGsAXEyDuLy',1756090313,'PjqAygCKaSQbkWzsAl7LkOSzu0odL2iY',1755485513,1755485513,'','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0','Lr8ttj1v3dfolGoexjvT5GDDA5CWCXax');
INSERT INTO session VALUES('eqsp4CpeubF7DjmGvyiyY49Ltzh81piB',1756127401,'uP6IsMWIf0JqRs0mFfEIaeRqrZrdoLHq',1755522601,1755522601,'','Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','Lr8ttj1v3dfolGoexjvT5GDDA5CWCXax');
INSERT INTO session VALUES('v78AiNMHj20cJDhZCeUmGoJZFkXi51de',1756127432,'SvRUN6C7fZY4dYqaIwRAoRoLMe1LiwzD',1755522632,1755522632,'','Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1','Lr8ttj1v3dfolGoexjvT5GDDA5CWCXax');
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer NOT NULL,
	`image` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
, role text DEFAULT 'employee' NOT NULL);
INSERT INTO user VALUES('Lr8ttj1v3dfolGoexjvT5GDDA5CWCXax','OnePercent','signatureonepercent2025@gmail.com',1,NULL,2025-08-03T16:11:09.526Z,2025-08-03T16:11:09.526Z,'admin');
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
CREATE TABLE IF NOT EXISTS "leads" (
	`id` integer PRIMARY KEY NOT NULL,
	`month` text,
	`date` text,
	`name` text,
	`phone_number` text,
	`platform` text,
	`is_closed` integer,
	`status` text,
	`sales` integer,
	`remark` text,
	`trainer_handle` text,
	`closed_date` text,
	`closed_month` text,
	`closed_year` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO leads VALUES(1,'May','27/05/2025','dr.alexander','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(2,'May','27/05/2025','neyomi','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(3,'May','27/05/2025','Shahrash waran','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(4,'May','27/05/2025','Jun tingoogle','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(5,'May','30/05/2025','AAL','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(6,'May','30/05/2025','jassie healhty meal','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(7,'May','29/05/2025','Allie','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(8,'May','29/05/2025','Dean zain','','Facebook',0,'Consult',NULL,'consult ad , thinkingoogle to take 50 or 100 and waitingoogle FBor the Ambank machine to do installment','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(9,'May','29/05/2025','Wilson','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(10,'May','29/05/2025','Robin','601120902544','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(11,'May','28/05/2025','Celeste yau','60122116872','Facebook',0,'Consult',NULL,'Appointment on 4 june 5pm','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(12,'May','25/05/2025','Ari','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(13,'May','26/05/2025','lim si yong ( SY )','60168616300','Facebook',1,'Consult',5688,'bring Friend , Sunday 11am 7june','Vincent','26/05/2025','May','2025','2025-07-31 14:22:40');
INSERT INTO leads VALUES(14,'May','26/05/2025','Steve SC','60122152269','Facebook',1,'Consult',9250,'15 june 7am','Junyi trial','26/05/2025','May','2025','2025-07-31 14:22:40');
INSERT INTO leads VALUES(15,'May','26/05/2025','Jeanette','60146194808','Facebook',0,'No Reply',NULL,'Membership','Vincent',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(16,'May','27/05/2025','sam','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(17,'May','30/05/2025','neyomi','60123917318','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(18,'May','27/05/2025','shahrash','60162514161','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(19,'May','30/05/2025','jun tingoogle','60169028281','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(20,'May','30/05/2025','AAL-FB-May','60193807414','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(21,'May','30/05/2025','Allie','60176891382','Insta',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(22,'June','05/06/2025','Mrs.Lim','','Facebook',0,'No Reply',NULL,'PT','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(23,'June','06/06/2025','Lei Jingoogle','','Facebook',0,'No Reply',NULL,'','Vincent',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(24,'June','06/06/2025','FBongoogle','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(25,'June','10/06/2025','googleeorgooglee','','Insta',0,'No Reply',NULL,'PT','Junyi trial',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(26,'June','09/06/2025','Terence','','Facebook',1,'Consult',5688,'PT','Junyi trial','09/06/2025','June','2025','2025-07-31 14:22:40');
INSERT INTO leads VALUES(27,'June','09/06/2025','Matthew Aw','','Insta',0,'No Reply',NULL,'PT','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(28,'June','09/06/2025','Yap Hwee Mingoogle','','Facebook',1,'Consult',5688,'','','09/06/2025','June','2025','2025-07-31 14:22:40');
INSERT INTO leads VALUES(29,'June','01/06/2025','Mr. lee','','jasper BR',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(30,'June','01/06/2025','FBoo','','Facebook',0,'No Reply',NULL,'','Consult ad , suppose wan walk in now close him PT',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(31,'June','01/06/2025','May Yuen','','Insta',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(32,'June','01/06/2025','wei sin','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(33,'June','01/06/2025','kok zhangoogle','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(34,'June','01/06/2025','Jason low','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(35,'June','02/06/2025','FBelicia','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(36,'June','02/06/2025','david','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(37,'June','02/06/2025','choon yen tan','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(38,'June','01/06/2025','danial','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(39,'June','01/06/2025','savithra','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(40,'June','01/06/2025','arvindan','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(41,'June','01/06/2025','laura chen','60122792868','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(42,'June','20/06/2025','Celine','','Insta',1,'Consult',5688,'','','20/06/2025','June','2025','2025-07-31 14:22:40');
INSERT INTO leads VALUES(43,'June','01/06/2025','constance','601153319319','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(44,'June','02/06/2025','Abel Hao Tian','601172326513','Google',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(45,'June','03/06/2025','ps','60102617561','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(46,'June','06/06/2025','hou seongoogle','60166013553','Google',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(47,'June','10/06/2025','~','60194773327','N/A',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(48,'June','10/06/2025','🍋','6123161910','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(49,'June','12/06/2025','Ammar SyaFBuan','60196752088','N/A',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(50,'June','15/06/2025','roy wongoogle','601111376166','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(51,'June','14/06/2025','Imagoogleine','60129785505','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(52,'June','15/06/2025','michelle','60122006431','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(53,'June','16/06/2025','syaahir','601118720408','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(54,'June','17/06/2025','Abi','601116200648','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(55,'June','16/06/2025','Khas','60166317408','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(56,'June','15/06/2025','yc','601126619431','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(57,'June','15/06/2025','justin johari','60162256304','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(58,'June','15/06/2025','coco','60169672309','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(59,'June','05/06/2025','wolFBy','601170180801','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(60,'June','06/06/2025','FBongoogle','60169395934','N/A',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(61,'June','13/06/2025','huixian','60124975909','N/A',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(62,'June','14/06/2025','stephanie','60196172278','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(63,'June','18/06/2025','FBazroulrahman','60194882167','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(64,'June','18/06/2025','14','601117011146','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(65,'June','18/06/2025','tjunnn','60124411876','N/A',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(66,'June','18/06/2025','laura','601110731489','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(67,'June','18/06/2025','vinsonvc','60168626159','N/A',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(68,'June','20/06/2025','penny wongoogle','60127972686','N/A',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(69,'June','21/06/2025','Dead','60128146002','N/A',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(70,'June','22/06/2025','ahmad zikri','601123316205','Insta',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(71,'June','22/06/2025','googleerard law','60138328866','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(72,'June','01/06/2025','muhammad asyraFB','','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(73,'June','24/06/2025','t.w.c','60166508788','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(74,'June','22/06/2025','breandon','60102164492','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(75,'June','25/06/2025','zulkiFBlyM','60173657939','Google',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(76,'June','26/06/2025','Boris Cho','60104366024','N/A',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(77,'June','22/06/2025','rodney','60189071261','Insta',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(78,'June','28/06/2025','nino','60187805317','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(79,'June','28/06/2025','elmer','60109690580','Insta',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(80,'June','29/06/2025','izzat','60124199144','Google',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(81,'June','29/06/2025','L','60168268626','Google',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(82,'June','29/06/2025','Tammy','60179051881','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(83,'June','21/06/2025','mindy','60187772750','Google',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(84,'June','03/06/2025','jay','60125648313','Insta',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(85,'June','23/06/2025','nicholas','60183154975','Insta',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(86,'June','24/06/2025','sarah','60122367094','Insta',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(87,'June','11/06/2025','elsie','60162378778','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(88,'June','24/06/2025','raymond','60103664328','Insta',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(89,'June','27/06/2025','Beh sm','60123604710','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(90,'June','03/06/2025','david.c','60167490430','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(91,'June','06/06/2025','khukham','60195857665','Google',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(92,'June','01/06/2025','ashley','60167022107','Google',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(93,'June','06/06/2025','mark jun lead','60102254921','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(94,'June','19/06/2025','szehuei','60174200428','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(95,'June','09/06/2025','naim','60124269236','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(96,'June','09/06/2025','WW Wongoogle','60123728550','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(97,'June','01/06/2025','60146393876','60146393876','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(98,'June','10/06/2025','yi lynn','60199950888','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(99,'June','13/06/2025','roFBieq jaaFBar','60186671603','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(100,'June','14/06/2025','shien','60162457028','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(101,'June','06/06/2025','Dr akashah ismail','60132077644','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(102,'June','09/06/2025','richard wongoogle','60168005756','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(103,'June','02/06/2025','Arvindan','60123274027','Facebook',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(104,'June','12/06/2025','Mark kuan','60123116285','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(105,'July','01/07/2025','Ems','60178912507','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(106,'July','01/07/2025','Hangoogle','60179882663','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(107,'July','02/07/2025','no name','601121310155','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(108,'July','02/07/2025','J','60122820549','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(109,'July','04/07/2025','Arthur Yeow','60124265627','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(110,'July','05/07/2025','mai','60199903084','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(111,'July','05/07/2025','googlewen','6173228808','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(112,'July','05/07/2025','Blank','60172190653','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(113,'July','05/07/2025','Megoogleat Putri Izwaniza','60162727723','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(114,'July','05/07/2025','FBelix FBan','60122150468','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(115,'July','05/07/2025','Jasmine','601116301140','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(116,'July','05/07/2025','Jian FBei Liow','601121866188','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(117,'July','05/07/2025','Suriya Angoogleel','601164117947','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(118,'July','06/07/2025','Brian','60126459394','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(119,'July','07/07/2025','aFBiFBi','447399322872','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(120,'July','07/07/2025','Celine','60105561610','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(121,'July','07/07/2025','Suresh','60172847572','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(122,'July','08/07/2025','C','60123988227','Insta',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(123,'July','08/07/2025','eMily','60192121006','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(124,'July','09/07/2025','jamie Yongoogle','60133628033','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(125,'July','09/07/2025','B','60164333530','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(126,'July','10/07/2025','Damon','60179495615','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(127,'July','10/07/2025','Iven','60127819639','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(128,'July','10/07/2025','WIN','60163720085','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(129,'July','11/07/2025','p','60165117194','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(130,'July','12/07/2025','Kenneth','60163352192','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(131,'July','13/07/2025','Shirley','60182663833','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(132,'July','13/07/2025','Herny','60193458794','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(133,'July','13/07/2025','Peter','60192285690','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(134,'July','13/07/2025','Lawrence','60123342883','Flyer',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(135,'July','15/07/2025','Z','60129764479','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(136,'July','15/07/2025','Coco','60169672309','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(137,'July','16/07/2025','Deepa','60149303409','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(138,'July','16/07/2025','googleie','60122008464','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(139,'July','17/07/2025','Kendo','60169600372','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(140,'July','18/07/2025','AMIRUL','601128016171','Flyer',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(141,'July','18/07/2025','A. S Peter','60162257300','Flyer',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(142,'July','18/07/2025','Darren','601169366414','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(143,'July','18/07/2025','J','60178589819','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(144,'July','19/07/2025','Stargoogleaze','60122606623','Flyer',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(145,'July','19/07/2025','Isaac','60173616367','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(146,'July','19/07/2025','A Z R U L','60173025955','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(147,'July','19/07/2025','Kai Zhi','60178772334','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(148,'July','19/07/2025','Christine','60103366383','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(149,'July','19/07/2025','Austin','60126886869','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(150,'July','19/07/2025','Buddy Sattva','601128020350','Insta',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(151,'July','19/07/2025','Jason Yongoogle','60127907267','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(152,'July','19/07/2025','googleeraldine','60127111698','Insta',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(153,'July','20/07/2025','VV','601110706602','Flyer',1,'Consult',9250,'','','20/07/2025','July','2025','2025-07-31 14:22:40');
INSERT INTO leads VALUES(154,'July','20/07/2025','Novita','60125357777','Insta',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(155,'July','20/07/2025','KHIM','60162384487','Flyer',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(156,'July','20/07/2025','Irene','60123055701','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(157,'July','20/07/2025','Amirul','60187824689','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(158,'July','20/07/2025','Karl','601116832119','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(159,'July','20/07/2025','Jessey','60163290905','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(160,'July','21/07/2025','Celyn','60143147688','Google',1,'Consult',5688,'','','21/07/2025','July','2025','2025-07-31 14:22:40');
INSERT INTO leads VALUES(161,'July','21/07/2025','Kelvin Teo','60165757916','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(162,'July','21/07/2025','Mei Tingoogle','601162216180','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(163,'July','21/07/2025','Dr Coco Wongoogle','60128844226','Insta',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(164,'July','22/07/2025','XuanLin','601133228131','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(165,'July','22/07/2025','FBaez TauFBix','60123746709','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(166,'July','22/07/2025','Khaidil FBahmi','60109266843','Facebook',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(167,'July','22/07/2025','Moon','60109863826','Insta',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(168,'July','23/07/2025','Vijay Vaswani','60173456762','Website',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(169,'July','23/07/2025','dorcas leongoogle','60124051649','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(170,'July','23/07/2025','TripleC','60162485909','Google',0,'',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(171,'July','25/07/2025','Meyla','60178838817','Google',0,'No Reply',NULL,'','',NULL,NULL,NULL,'2025-07-31 14:22:40');
INSERT INTO leads VALUES(172,'July','31/07/2025','JO-Ann LOO','60193331227','Facebook',0,'No Reply',0,'','',NULL,NULL,NULL,'2025-08-01 07:56:57');
INSERT INTO leads VALUES(173,'July','26/07/2025','Akhil','23054962828','Google',0,'',0,'Follow up','',NULL,NULL,NULL,'2025-08-01 08:26:58');
INSERT INTO leads VALUES(174,'July','26/07/2025','Jasper Zhou','60179877398','Google',0,'No Reply',0,'For membership','',NULL,NULL,NULL,'2025-08-01 08:27:50');
INSERT INTO leads VALUES(175,'July','27/07/2025','Chetan Mehta','4540503838','Google',1,'',888,'','','27/07/2025','July','2025','2025-08-01 08:28:30');
INSERT INTO leads VALUES(176,'July','27/07/2025','Nazrin Faris','60129759638','Facebook',0,'No Reply',0,'Follow up','',NULL,NULL,NULL,'2025-08-01 08:29:11');
INSERT INTO leads VALUES(177,'July','28/07/2025','JY','601426448172','jasper BR',1,'Consult',9250,'','','28/07/2025','July','2025','2025-08-01 08:30:53');
INSERT INTO leads VALUES(178,'July','17/07/2025','Janeen Thong Wei Leen','60176816024','jasper BR',1,'Consult',9250,'','','17/07/2025','July','2025','2025-08-01 09:03:29');
INSERT INTO leads VALUES(179,'July','28/07/2025','糯糯','60108813318','XHS',0,'Consult',0,'','',NULL,NULL,NULL,'2025-08-01 09:04:23');
INSERT INTO leads VALUES(180,'July','28/07/2025','嫔嫔有李','60124353341','XHS',1,'Consult',1580,'','','28/07/2025','July','2025','2025-08-01 09:04:50');
INSERT INTO leads VALUES(181,'July','29/07/2025','Jie Wei Pang','60167243102','Google',0,'Consult',0,'','',NULL,NULL,NULL,'2025-08-01 09:05:31');
INSERT INTO leads VALUES(182,'July','29/07/2025','Akashah','60196050600','Facebook',0,'No Reply',0,'','',NULL,NULL,NULL,'2025-08-01 09:06:42');
CREATE TABLE IF NOT EXISTS "advertising_costs" (
	`id` integer PRIMARY KEY NOT NULL,
	`month` integer NOT NULL,
	`year` integer NOT NULL,
	`cost` real NOT NULL,
	`currency` text DEFAULT 'RM',
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO advertising_costs VALUES(1,5,2025,140.5,'RM','2025-07-31 15:38:54','2025-07-31 16:15:49');
INSERT INTO advertising_costs VALUES(2,6,2025,1215.37,'RM','2025-07-31 16:22:21','2025-07-31 16:22:21');
CREATE TABLE d1_migrations(
		id         INTEGER PRIMARY KEY AUTOINCREMENT,
		name       TEXT UNIQUE,
		applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
INSERT INTO d1_migrations VALUES(1,'0000_chemical_quicksilver.sql','2025-08-04 15:29:10');
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('d1_migrations',1);
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);
