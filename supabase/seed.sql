-- Insert 11 placeholder questions
INSERT INTO public.questions (question_number, question_text, answer_hash) VALUES
(1, 'Placeholder Question 1', 'placeholder_hash_1'),
(2, 'Placeholder Question 2', 'placeholder_hash_2'),
(3, 'Placeholder Question 3', 'placeholder_hash_3'),
(4, 'Placeholder Question 4', 'placeholder_hash_4'),
(5, 'Placeholder Question 5', 'placeholder_hash_5'),
(6, 'Placeholder Question 6', 'placeholder_hash_6'),
(7, 'Placeholder Question 7', 'placeholder_hash_7'),
(8, 'Placeholder Question 8', 'placeholder_hash_8'),
(9, 'Placeholder Question 9', 'placeholder_hash_9'),
(10, 'Placeholder Question 10', 'placeholder_hash_10'),
(11, 'Placeholder Question 11', 'placeholder_hash_11')
ON CONFLICT (question_number) DO NOTHING;
