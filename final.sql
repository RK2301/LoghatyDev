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
  verification_code smallint,
  sent_time datetime,
  CONSTRAINT check_id_regex CHECK (id REGEXP '^[0-9]{9}$'),
  CONSTRAINT check_phone_regex CHECK (phone REGEXP '^[0-9]{10}$' OR phone REGEXP '^[0-9]{9}$')
);

CREATE TABLE classes(
  class_id tinyint PRIMARY KEY
--   class_name VARCHAR(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
);

-- only classes for the students --  
insert into classes (class_id) values(1);
insert into classes (class_id) values(2);
insert into classes (class_id) values(3);
insert into classes (class_id) values(4);
insert into classes (class_id) values(5);
insert into classes (class_id) values(6);
insert into classes (class_id) values(7);
insert into classes (class_id) values(8);
insert into classes (class_id) values(9);
insert into classes (class_id) values(10);
insert into classes (class_id) values(11);
insert into classes (class_id) values(12);
insert into classes (class_id) values(13);

CREATE TABLE Students (
  id char(9) REFERENCES Users (user_id)  on delete cascade,
  enrollment_date DATE NOT NULL,
  class_id INT REFERENCES classes (class_id),
  primary key(id)
);

CREATE TABLE Teacher(
	id char(9) primary key,
	hire_date DATE NOT NULL,
	notify time,
    isManager boolean not null,
    constraint foreign key (id) references users(id) on delete cascade
);

alter table teacher add column notify time;


-- alter table teacher 
-- add isManager boolean not null
-- default false;

-- alter table teacher 
-- add notify tinyint check(notify >= 0)
-- default 0;

create table Course_Subject (
   id smallint auto_increment primary key,
   en varchar(30) not null,
   ar varchar(30) character SET utf8mb4 COLLATE utf8mb4_unicode_ci,
   he varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
);

-- insert into course_subject (name_english, name_arabic, name_hebrow) values ('Language', 'لغة', 'שפה');

create table day_of_week(
  id tinyint auto_increment primary key,
  day varchar(10) not null unique
);
-- only values-- 
insert into day_of_week (day) values ('sun');
insert into day_of_week (day) values ('mon');
insert into day_of_week (day) values ('tue');
insert into day_of_week (day) values ('wed');
insert into day_of_week (day) values ('thu');
insert into day_of_week (day) values ('fri');
insert into day_of_week (day) values ('sat');

CREATE TABLE Language (
  language_id tinyint PRIMARY KEY auto_increment , -- 1-> 3 --
  language_name varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
  -- 'ar' , 'en' ,'he'
);

insert into Language (language_name) values ('en');
insert into Language (language_name) values ('ar');
insert into Language (language_name) values ('he');

CREATE TABLE Courses(
	course_id INT PRIMARY KEY auto_increment,
	course_name VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    lesson_num tinyint check(lesson_num >0) ,
    is_active bool default true,
    subject_id smallint not null,
	teacher_id char(9),
	receive_notification_teacher BOOLEAN DEFAULT false,
    meet_duration float not null,
    course_type char(1) not null check( course_type in ('g', 'i')),
    constraint foreign key (teacher_id) references teacher(id) ,
    constraint foreign key (subject_id) references course_subject(id),
	constraint foreign key (meet_Day) references day_of_week(id)
);

-- alter table courses add column meet_duration float not null;
-- ALTER TABLE courses DROP FOREIGN KEY courses_ibfk_3;
-- alter table courses drop column meet_duration;
-- SHOW CREATE TABLE courses;
-- select * from courses;
-- update courses set meet_duration=2.5 where course_id = 1;

CREATE TABLE lang_course (
    course_id INT,
    language_id tinyint,
    constraint FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE,
    constraint FOREIGN KEY (language_id) REFERENCES Language(language_id) ON DELETE CASCADE
);

-- select * from courses;
-- delete from lessons where course_id=32;
-- delete from course_meetings where course_id=33;
-- delete from courses where course_id=32;

Create Table If not exists course_meetings ( 
course_id int,
day_id tinyint,
start_time time not null,
primary key (course_id, day_id),
constraint FOREIGN KEY (course_id) REFERENCES Courses(course_id) ON DELETE CASCADE,
constraint FOREIGN KEY (day_id) REFERENCES day_of_week(id) ON DELETE CASCADE
);

-- insert into course_meetings values(1, 1, '14:00');
-- insert into course_meetings values(1, 4, '12:00');
-- select * from course_meetings as cm inner join day_of_week dof on dof.id=cm.day_id;

CREATE TABLE Homework(
	homework_id INT PRIMARY KEY,
	title VARCHAR(50) NOT NULL,
	due_date DATE NOT NULL,
    grade int Not Null,
	unit int REFERENCES StudyUnits (unit_id)
);

CREATE TABLE classes(
  class_id INT PRIMARY KEY,
  class_name VARCHAR(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
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
select * from Lessons;
-- delete from lessons where lesson_id>32;

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
  FOREIGN KEY (file_id) REFERENCES StudyUnitFile(file_id) on delete cascade,
  FOREIGN KEY (unit_id) REFERENCES StudyUnits(unit_id) on delete cascade,
  primary key (file_id, unit_id)
);
select * from lessons;
select * from studyunits where lesson_id=1;
select * from StudyUnitFiles as sufs inner join studyunitfile suf on sufs.file_id=suf.file_id where sufs.unit_id=1;

  -- Home work table -- 
  create table if not exists homeWorkUnit (
  unit_id int primary key,
  hw_title varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  submit_time datetime not null,
  upload_time datetime not null,
  is_visible boolean default true not null,
  visible_time datetime  ,
  files_num tinyint check( files_num > 0 ),
  constraint foreign key (unit_id) references studyunits(unit_id) on delete cascade
  );
  
  create table if not exists submitHomeWork (
   student_id char(9),
   hw_id int,
   upload_time datetime  not null,
   grade tinyint check( grade>=0 and grade<=100 ),
   submit_note varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
   constraint foreign key (student_id) references students(id) on delete cascade,
   constraint foreign key (hw_id) references homeWorkUnit(unit_id) on delete cascade,
   primary key(student_id, hw_id)
  );
    
-- update  submithomework set submit_note='Good Work, but the second question answers isnt what we learned in the last week lesson, please check the answers i published this morning' where student_id='123456789' and hw_id=4;
--   alter table submitHomeWork add column submit_note varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

  create table if not exists homeWorkFile(
  file_id int auto_increment ,
  file_name varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  student_id char(9),
  hw_id int,
  constraint foreign key (hw_id, student_id) references submitHomeWork(hw_id, student_id) on delete cascade,
  primary key (file_id)
);
-- important --
ALTER TABLE homeWorkFile AUTO_INCREMENT=1;

create table if not exists message(
message_id int auto_increment primary key,
message_title varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
message_content varchar(1000) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
sent_time datetime not null,
manager_id char(9) not null,
constraint foreign key (manager_id) references teacher(id) on delete cascade
);

create table if not exists message_user(
 message_id int not null,
 user_id char(9) not null,
 seen boolean default false,
 constraint foreign key(message_id) references message(message_id) on delete cascade,
 constraint foreign key(user_id) references users(id) on delete cascade
);

CREATE TABLE Levels (
  level_num tinyint,
  level_points smallint not null,
  win_point tinyint NOT NULL,
  language_id tinyint,
  constraint FOREIGN KEY (language_id) REFERENCES Language (language_id),
  primary key (level_num, language_id)
);

insert into levels (level_num, language_id, level_points, win_point) values (1, 1, 100, 4);
insert into levels (level_num, language_id, level_points, win_point) values (2, 1, 200, 5);
	
CREATE TABLE IF NOT EXISTS StudentLevel (
  student_id char(9),
  level_num tinyint,
  language_id tinyint,
  points smallint default 0 ,
  last_seen datetime not null,
  constraint FOREIGN KEY (student_id) REFERENCES students(id),
  constraint FOREIGN KEY (level_num, language_id) REFERENCES Levels(level_num, language_id),
  primary key (student_id, level_num, language_id)
 );

 insert into StudentLevel (student_id, level_num, language_id, last_seen)  values ('123456789', 1, 1, curdate());
 
--  CREATE TABLE StudentsLanguages (
--   id char(9),
--   language_id tinyint,
--   PRIMARY KEY (id, language_id),
--   constraint FOREIGN KEY (id) REFERENCES Students(id),
--   constraint FOREIGN KEY (language_id) REFERENCES Language(language_id),
--   points smallint default 0 ,
--   last_seen datetime not null
--   );
 
CREATE TABLE Words (
  word_id INT PRIMARY KEY AUTO_INCREMENT,
  word_text VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  level_num tinyint,
  language_id tinyint,
  constraint FOREIGN KEY (language_id, level_num) REFERENCES Levels(language_id, level_num)
);

-- insert into words(word_text, level_num, language_id) values ( 'Hello', 1, 1 );
-- insert into words(word_text, level_num, language_id) values ( 'Hi', 1, 1 );
-- insert into words(word_text, level_num, language_id) values ( 'Name', 1, 1 );
-- insert into words(word_text, level_num, language_id) values ( 'i am', 1, 1 );
-- insert into words(word_text, level_num, language_id) values ( 'cat', 1, 1 );
-- insert into words(word_text, level_num, language_id) values ( 'nickname', 1, 1 );



CREATE TABLE Sentences (
  sentence_id INT PRIMARY KEY AUTO_INCREMENT,
  sentence_text VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  level_num tinyint,
  language_id tinyint,
  constraint FOREIGN KEY (language_id, level_num) REFERENCES Levels(language_id, level_num)
);

CREATE TABLE SentenceWords (
  sentence_id INT,
  word_id INT,
  PRIMARY KEY (sentence_id, word_id),
  FOREIGN KEY (sentence_id) REFERENCES Sentences (sentence_id),
  FOREIGN KEY (word_id) REFERENCES Words (word_id)
);

select * 
from (
 select s.sentence_id, s.sentence_text, w.word_id, w.word_text
from studentLevel as sl
inner join Language l on l.language_id=sl.language_id
inner join sentences as s on s.level_num=sl.level_num and s.language_id=sl.language_id
inner join SentenceWords sw on sw.sentence_id=s.sentence_id
inner join words as w on w.word_id=sw.word_id
where sl.student_id='123456789' and language_name='en'
 and sw.sentence_id not in (
 select ss.sentence_id
 from StudentSentences ss
 where ss.sentence_id=s.sentence_id and ss.know=true and id=sl.student_id
 )    and  sw.word_id in (
						select min(sw2.word_id)
						from SentenceWords as sw2
						where sw2.sentence_id=sw.sentence_id)
  UNION
select s.sentence_id, s.sentence_text, w.word_id, w.word_text
from studentLevel as sl
inner join Language l on l.language_id=sl.language_id
inner join sentences as s on s.level_num=sl.level_num and s.language_id=sl.language_id
inner join words as w on w.level_num=sl.level_num and w.language_id=sl.language_id
where sl.student_id='123456789' and language_name='en'
 and s.sentence_id not in (
 select ss.sentence_id
 from StudentSentences ss
 where ss.sentence_id=s.sentence_id and ss.know=true and id=sl.student_id
 )    and  w.word_id not in (
						select sw2.word_id
						from SentenceWords as sw2
						where sw2.sentence_id=s.sentence_id)
       and w.word_id in (
        select wrongWords.word_id
        from (select w2.word_id
        from words as w2
        left join SentenceWords sw3 on  w2.word_id=sw3.word_id 
        where  sw3.sentence_id is null or sw3.sentence_id <> s.sentence_id
        limit 3) as wrongWords
       )) as questions
       order by questions.sentence_id
       limit 8;                 


CREATE TABLE Pictures (
  picture_id INT PRIMARY KEY AUTO_INCREMENT,
  picture_data LONGBLOB
);

CREATE TABLE PicturesWord(
  picture_id INT,
  word_id INT,
  PRIMARY KEY (picture_id, word_id),
  FOREIGN KEY (picture_id) REFERENCES Pictures (picture_id),
  FOREIGN KEY (word_id) REFERENCES Words (word_id)
);


CREATE TABLE WordSynonyms (
  word_id INT,
  synonym_id INT,
  PRIMARY KEY (word_id, synonym_id),
  FOREIGN KEY (word_id) REFERENCES Words(word_id),
  FOREIGN KEY (synonym_id) REFERENCES Words(word_id)
);
  
  
  CREATE TABLE StudentWords (
    id char(9),
	word_id INT,
	PRIMARY KEY (id, word_id),
	constraint FOREIGN KEY (id) REFERENCES Students(id),
	constraint FOREIGN KEY (word_id) REFERENCES Words(word_id),
	know boolean not null
    );
    
CREATE TABLE StudentPictures (
    id INT,
    word_id INT,
    picture_id INT,
    PRIMARY KEY (picture_id, word_id, id),
    constraint FOREIGN KEY (id) REFERENCES Students (id) ON UPDATE CASCADE ON DELETE CASCADE,
    constraint FOREIGN KEY (picture_id, word_id) REFERENCES PicturesWord (picture_id, word_id),
    know BOOLEAN NOT NULL
);

CREATE TABLE StudentSentences (
    id CHAR(9),
    sentence_id int,
	PRIMARY KEY (id, sentence_id),
    constraint FOREIGN KEY (id) REFERENCES Students (id)  ON DELETE CASCADE,
    constraint FOREIGN KEY (sentence_id) REFERENCES Sentences (sentence_id),
    know BOOLEAN NOT NULL
);


  CREATE TABLE Achievement (
  arch_id INT PRIMARY KEY AUTO_INCREMENT,
  arch_name varchar(70) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  picture LONGBLOB
  );
  
  CREATE TABLE IF NOT EXISTS StudentAchievement (
   id char(9),
   arch_id int,
   win_date datetime not null,
   constraint FOREIGN KEY (id) REFERENCES Students (id),
   constraint FOREIGN KEY (arch_id) REFERENCES Archievement (arch_id),
   primary key (id, arch_id)
  );
  


create table if not exists shift (
  teacher_id char(9),
  start_shift datetime not null,
  start_location point not null,
  end_shift datetime,
  end_location point,
  shift_note varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  need_permission boolean,
  constraint foreign key (teacher_id) references teacher(id) on delete cascade,
  primary key(teacher_id, start_shift)
);

select * from shift where start_shift >= '2023-09-01 00:00' and (end_shift <= '2023-09-30 23:59' or end_shift is null) ;
update shift set shift_note='only note' where teacher_id='321321321';
alter table shift add column shift_note varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
insert into  shift (teacher_id, start_shift, start_location) values ('321321321', '2023-09-10', ST_GeomFromText('POINT(32.0803 34.7805)'));
select teacher_id, start_shift, ST_X(start_location) as start_latitude, ST_Y(start_location) as start_longitude
 from shift
where teacher_id='211406478' and end_shift is null;


update shift set end_shift=curdate(), end_location=ST_GeomFromText('POINT(34.7805 34.7805)')
 where teacher_id='211406478' and start_shift='2023-06-03 00:00:00';
 
update shift set start_shift='2023-09-07 17:28:57', end_shift='2023-09-07 18:00:00' 
where teacher_id='211406478' and start_shift='2023-09-07 12:15:00';

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


INSERT INTO users values ('211406478','Rami', 'Khattab', 'Username', 'rami.khattab0@gmail.com', 'Password', '0543957965', curdate());
insert into teacher values ('211406478', curdate(), null, true);

INSERT INTO users values ('311509783','Sara', 'LL', 'Sara123', 'sara.123@gmail.com', 'SARA', '0543657965', curdate());
insert into teacher values ('311509783', curdate(), null, true);


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
