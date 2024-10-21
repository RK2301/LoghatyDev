Create database Loghaty;
USE Loghaty;
show tables;
CREATE TABLE Users (
  id CHAR(9) PRIMARY KEY,
  firstname VARCHAR(50) NOT NULL,
  lastname VARCHAR(50) NOT NULL,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(50),
  phone VARCHAR(50) NOT NULL,
  birth_date DATE,
  CONSTRAINT check_id_regex CHECK (id REGEXP '^[0-9]{9}$'),
  CONSTRAINT check_phone_regex CHECK (phone REGEXP '^[0-9]{10}$' OR phone REGEXP '^[0-9]{9}$')
);
CREATE TABLE Students (
  id char(9) REFERENCES Users (user_id) on update cascade on delete cascade,
  enrollment_date DATE NOT NULL,
  payment_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  payment_date DATE,
  payment_method VARCHAR(20),
  primary key(id)
);

CREATE TABLE Teacher(
	id char(9) primary key,
	hire_date DATE NOT NULL,
    constraint foreign key (id) references users(id) on delete cascade
);


create table Course_Subject (
   id smallint auto_increment primary key,
   name_english varchar(30),
   name_arabic varchar(30) character SET utf8mb4 COLLATE utf8mb4_unicode_ci,
   name_hebrow varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
);
-- need trigger to ensure at least one field has value --
insert into course_subject (name_english, name_arabic, name_hebrow) values ('Language', 'لغة', 'שפה');

create table day_of_week(
  id tinyint auto_increment primary key,
  day varchar(10) not null unique
);
-- only values-- 
insert into day_of_week (day) values ('sun');
insert into day_of_week (day) values ('mon');
insert into day_of_week (day) values ('tue');
insert into day_of_week (day) values ('wed ');
insert into day_of_week (day) values ('thu');
insert into day_of_week (day) values ('fri');
insert into day_of_week (day) values ('sat');

CREATE TABLE Courses(
	course_id INT PRIMARY KEY auto_increment,
	course_name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    END_DATE DATE,
    lesson_num tinyint check(lesson_num >0) ,
    is_active bool default true,
    meet_Time time,
    meet_Day tinyint not null ,
    subject_id smallint not null,
	teacher_id char(9),
	receive_notification_teacher BOOLEAN DEFAULT false,
    constraint foreign key (teacher_id) references teacher(id) ,
    constraint foreign key (subject_id) references course_subject(id),
	constraint foreign key (meet_Day) references day_of_week(id)
);
  
create table lang_course (
    course_id int primary key,
    lang varchar(10) not null,
    constraint foreign key (course_id) references Courses(course_id)  on delete cascade
); 
-- need trigger to ensure the values to lang filed are -> en, ar, he

    
CREATE TABLE Homework(
	homework_id INT PRIMARY KEY,
	title VARCHAR(50) NOT NULL,
	due_date DATE NOT NULL,
    grade int Not Null,
	unit int REFERENCES StudyUnits (unit_id)
);

CREATE TABLE Questions(
	question_id INT PRIMARY KEY,
	question_text VARCHAR(50) NOT NULL,
	points INT
    );

CREATE TABLE Answers(
	answer_id INT PRIMARY KEY,
	answer_text VARCHAR(50) NOT NULL,
    is_right BOOLEAN NOT NULL,
	question_id int  REFERENCES Questions (question_id)
);

CREATE TABLE Homeworks_Questions (
  homework_id INT NOT NULL,
  question_id INT NOT NULL,
  PRIMARY KEY (homework_id, question_id),
  FOREIGN KEY (homework_id) REFERENCES Homework (homework_id),
  FOREIGN KEY (question_id) REFERENCES Questions (question_id)
);

CREATE TABLE Students_Courses (
  student_id char(9) NOT NULL,
  course_id INT NOT NULL,
  receive_notification BOOLEAN DEFAULT true,
  PRIMARY KEY (student_id, course_id),
  constraint foreign key  (student_id) REFERENCES Students (id),
  constraint FOREIGN KEY (course_id) REFERENCES Courses (course_id)
);

Create TABLE files (
 id int primary key auto_increment,
 name varchar(100) not null,
 upload_date datetime not null,
 manager_id char(9),
 user_id char(9),
 foreign key( manager_id ) references users(id),
 foreign key ( user_id) references users(id)
);

CREATE TABLE Notes (
  note_id INT PRIMARY KEY AUTO_INCREMENT,
  note_title varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  note_text VARCHAR(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  created_at DATE NOT NULL,
  created_by char(9) NOT NULL,
  recipient_id char(9) NOT NULL,
  FOREIGN KEY (created_by) REFERENCES Users(id),
  FOREIGN KEY (recipient_id) REFERENCES Users(id)
);

CREATE TABLE Lessons (
  lesson_id INT PRIMARY KEY AUTO_INCREMENT,
  course_id INT,
  lesson_title varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  lesson_date DATE,
  lesson_time Time,
  is_visible BOOLEAN not null,
  visible_time datetime,
  FOREIGN KEY (course_id) REFERENCES Courses(course_id)
);

CREATE TABLE StudyUnitNotes (
  note_id INT PRIMARY KEY AUTO_INCREMENT,
  note_text varchar(500)
);

CREATE TABLE StudyUnits(
unit_id INT PRIMARY KEY AUTO_INCREMENT, 
lesson_id INT,
note_id int,
FOREIGN KEY (lesson_id) REFERENCES Lessons(lesson_id),
FOREIGN KEY (note_id) REFERENCES StudyUnitNotes(note_id)
);

CREATE TABLE StudyUnitFile(
  file_id INT PRIMARY KEY AUTO_INCREMENT,
  upload_date date not null,
  user_upload char(9) not null,
  file_name varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  file_path VARCHAR(255),
  FOREIGN KEY (user_upload) REFERENCES Teacher(id)
);

create table StudyUnitFiles (
  file_id int,
  unit_id int,
  FOREIGN KEY (file_id) REFERENCES StudyUnitFile(file_id),
  FOREIGN KEY (unit_id) REFERENCES StudyUnits(unit_id),
  primary key (file_id, unit_id)
);

CREATE TABLE Levels (
  level_id INT PRIMARY KEY,
  level_name VARCHAR(50) NOT NULL
);
CREATE TABLE Languages (
  language_id INT PRIMARY KEY,
  language_name varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
  -- 'ar' , 'en' ,'he'
);
 
  -- Home work table -- 
  create table if not exists homeWorkUnit (
  unit_id int primary key,
  hw_title varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  submit_time datetime not null,
  upload_time datetime not null,
  is_visible boolean not null,
  visible_time datetime  ,
  files_num tinyint check( files_num > 0 ),
  constraint foreign key (unit_id) references studyunits(unit_id) on delete cascade
  );

  create table if not exists submitHomeWork (
   student_id char(9),
   hw_id int,
   upload_time datetime  not null,
   grade tinyint check( grade>=0 and grade<=100 ),
   constraint foreign key (student_id) references students(id) on delete cascade,
   constraint foreign key (hw_id) references homeWorkUnit(unit_id) on delete cascade,
   primary key(student_id, hw_id)
  );

  create table if not exists homeWorkFile(
  file_id int auto_increment ,
  file_name varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  student_id char(9),
  hw_id int,
  constraint foreign key (hw_id) references submitHomeWork(hw_id) on delete cascade,
  constraint foreign key (student_id) references submitHomeWork(student_id) on delete cascade,
  primary key (file_id, student_id, hw_id)
);
-- important --
ALTER TABLE homeWorkFile AUTO_INCREMENT=1;


 
 -- -- -- -- -- -- -- -- Insert Quries -- -- -- -- -- -- -- 
-- SELECT l.lesson_id, l.course_id, l.lesson_title, l.lesson_date, l.lesson_time
-- , l.is_visible, l.visible_time, su.unit_id, su.note_id, n.note_text,
--  f.file_id, f.file_name, f.file_path, hwu.is_visible as 'hw_visible', hwu.visible_time as 'hw_visible_time', hwu.files_num,
--  hwu.hw_title, hwu.submit_time
-- FROM Lessons as l
-- LEFT JOIN StudyUnits su ON l.lesson_id = su.lesson_id
-- LEFT JOIN homeWorkUnit hwu on su.unit_id = hwu.unit_id
-- LEFT JOIN StudyUnitNotes n ON su.note_id = n.note_id
-- LEFT JOIN StudyUnitFiles sf ON su.unit_id = sf.unit_id
-- LEFT JOIN StudyUnitFile f ON sf.file_id = f.file_id
-- WHERE l.course_id = 1 ;

insert into lessons (course_id, lesson_title, lesson_date, lesson_time, is_visible) values (1, 'basic grammer', curdate(), '13:00', true);
insert into lessons (course_id, lesson_title, lesson_date, lesson_time, is_visible, visible_time) values (1, 'advance grammer', curdate(), '13:00', false, '2023-05-24 13:15');

insert into StudyUnitNotes (note_text) values ('some files for more info for today lessons');
insert into StudyUnits ( lesson_id, note_id) values (1, 1);

insert into StudyUnitFile (upload_date, user_upload, file_name ) values (curdate(), '211406478', 'basic.pdf');
insert into StudyUnitFile (upload_date, user_upload, file_name ) values (curdate(), '211406478', 'advance.pdf');

insert into StudyUnitFiles (file_id, unit_id) values (1, 1);
insert into StudyUnitFiles (file_id, unit_id) values (2, 1);


INSERT INTO users values ('211406478','Rami', 'Khattab', '21150923R', 'rami.khattab0@gmail.com', 'RamiKh2', '0543957965', curdate());
insert into teacher values ('211406478', curdate());

INSERT INTO users values ('311509783','Sara', 'LL', 'Sara123', 'sara.123@gmail.com', 'SARA', '0543657965', curdate());
insert into teacher values ('311509783', curdate());


 insert into courses (course_name, start_date, meet_Time, meet_Day, subject_id, teacher_id) values
 ('English Spring', curdate(), '18:15', 1, 1, '211406478' );
 
 insert into courses (course_name, start_date, meet_Time, meet_Day, subject_id, teacher_id) values
 ('اשפה עברית מועד אביב', curdate(), '10:00', 1, 1, '311509783' );
 
 
-- -- -- -- -- -- -- Insert Quries For homeworks-- -- -- 

insert into studyunitnotes (note_text) values ( 'First Homework, a simple questions on grammer' );
insert into StudyUnits (lesson_id, note_id) values (4, 4);
insert into studyunitfile (upload_date, user_upload, file_name) values (curdate(),'211406478', 'basic grammer' );
insert into studyunitfile (upload_date, user_upload, file_name) values (curdate(),'211406478', 'basic grammer 2' );

insert into studyunitfiles (unit_id ,file_id) values (4, 7);
insert into studyunitfiles (unit_id ,file_id) values (4, 8);

INSERT INTO users values ('123456789','Mark', 'Mark', '12345678M', 'mark.12@gmail.com', 'Mark12', '0543818271', curdate());
insert into students (id, enrollment_date) values ('123456789', curdate());

INSERT INTO users values ('987654321','John', 'John', '98765432J', 'john12@gmail.com', 'John12', '0504276489', curdate());
insert into students (id, enrollment_date) values ('987654321', curdate());

insert into Students_Courses (student_id, course_id) values ('123456789' ,1);
insert into Students_Courses (student_id, course_id) values ('987654321' ,1);


insert into homeWorkUnit (unit_id, hw_title, submit_time, is_visible, visible_time, files_num, upload_time) 
values (4, 'grammer exercies', '2023-05-30 23:00', true, null, 2, curdate());

insert into submitHomeWork (student_id, hw_id, upload_time) values ('123456789', 4, curdate());
insert into submitHomeWork (student_id, hw_id, upload_time) values ('987654321', 4, curdate());

insert into homeWorkFile (file_name, student_id, hw_id) values ('hw1_sol.pptx', '123456789', 4); 
insert into homeWorkFile (file_name, student_id, hw_id) values ('hw1_sol_2.pptx', '123456789', 4);

insert into homeWorkFile (file_name, student_id, hw_id) values ('hw1_sol.pdf', '987654321', 4); 
 

 