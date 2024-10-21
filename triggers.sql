DELIMITER //
/* Ensure at least one field has a value in the "Course_Subject" table */
CREATE TRIGGER ensure_subject_name BEFORE INSERT ON Course_Subject
FOR EACH ROW
BEGIN
  IF NEW.name_english IS NULL AND NEW.name_arabic IS NULL AND NEW.name_hebrow IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'At least one subject name must have a value.';
  END IF;
END //

/* Ensure the values in the "lang_course" table's "lang" field are either 'en', 'ar', or 'he' */
CREATE TRIGGER ensure_lang_value BEFORE INSERT ON lang_course
FOR EACH ROW
BEGIN
  IF NEW.lang NOT IN ('en', 'ar', 'he') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Invalid language value. Allowed values are "en", "ar", and "he".';
  END IF;
END //

/* Automatically update the "is_active" column in the "Courses" table based on the start and end dates */
DELIMITER //
CREATE TRIGGER update_course_status
BEFORE INSERT ON Courses
FOR EACH ROW
BEGIN
  IF NEW.end_date IS NOT NULL THEN
    IF NEW.start_date > NEW.end_date THEN
      SET NEW.is_active = FALSE;
    END IF;
  END IF;
END //

/* Prevent deleting the default user from the "Users" table */
CREATE TRIGGER prevent_delete_default_user
BEFORE DELETE ON Users
FOR EACH ROW
BEGIN
  IF OLD.id = '211406478' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Cannot delete the default user.';
  END IF;
END //
DELIMITER ;
