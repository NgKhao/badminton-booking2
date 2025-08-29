-- 0. ENUM types
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE court_status AS ENUM ('available', 'maintenance', 'unavailable');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE email_status AS ENUM ('sent', 'failed', 'pending');

-- 1. Users
CREATE TABLE users (
                       user_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                       email VARCHAR(100) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       full_name VARCHAR(100),
                       phone VARCHAR(20),
                       role user_role NOT NULL DEFAULT 'customer',
                       is_active BOOLEAN DEFAULT TRUE,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customers (1-1 với Users)
CREATE TABLE customers (
                           customer_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                           user_id INT NOT NULL UNIQUE,
                           phone VARCHAR(20),
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Courts
CREATE TABLE courts (
                        court_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                        court_name VARCHAR(50) NOT NULL,
                        court_type VARCHAR(50), -- 'Trong nhà' hoặc 'Ngoài trời'
                        status court_status DEFAULT 'available',
                        hourly_rate DECIMAL(10,2) NOT NULL,
                        description TEXT,
                        images JSON,
                        is_active BOOLEAN DEFAULT TRUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bookings
CREATE TABLE bookings (
                          booking_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                          booking_code VARCHAR(20) UNIQUE,
                          customer_id INT NOT NULL,
                          court_id INT NOT NULL,
                          booking_date DATE NOT NULL,
                          start_time TIME NOT NULL,
                          end_time TIME NOT NULL,
                          status booking_status DEFAULT 'pending',
                          total_amount DECIMAL(10,2),
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
                          FOREIGN KEY (court_id) REFERENCES courts(court_id)
);

-- 5. Services
CREATE TABLE services (
                          service_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                          service_name VARCHAR(100) NOT NULL,
                          service_type VARCHAR(50),
                          description TEXT,
                          unit_price DECIMAL(10,2) NOT NULL,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- 8. Transactions
CREATE TABLE transactions (
                              transaction_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                              amount DECIMAL(10,2) NOT NULL,
                              transaction_date DATE DEFAULT CURRENT_DATE,
                              payment_method VARCHAR(50),
                              booking_id INT,
                              created_by INT,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              FOREIGN KEY (created_by) REFERENCES users(user_id)

);

-- 10. AI Conversations
CREATE TABLE ai_conversations (
                                  ai_conversation_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                                  customer_id INT,
                                  conversation_content VARCHAR(100),
                                  messages JSON,
                                  ai_recommendations TEXT,
                                  weather_data JSON,
                                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                  FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

-- 11. Email Logs
CREATE TABLE email_logs (
                            email_log_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                            recipient_email VARCHAR(100) NOT NULL,
                            subject VARCHAR(200),
                            email_type VARCHAR(50),
                            template_used VARCHAR(50),
                            status email_status DEFAULT 'pending',
                            reference_id INT,
                            reference_type VARCHAR(20),
                            sent_at TIMESTAMP NULL,
                            error_message TEXT,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
