# Full Stack Web Application (API + Frontend) for an Online Delivery Restaurant

**Technologies:** C#, .NET, PostgreSQL, HTML/CSS, JavaScript (Frontend)
**Description:**
Developed a full-stack project featuring an API for an online delivery restaurant with a comprehensive system including user authentication, dish management, order cart, and rating functionality.  

**Features:**  

- **User Authentication**  
  - Registration, login, logout  
  - Profile retrieval and updates  
  - Support for multiple administrators
- **Dish Management**  
  - Filtering and sorting  
  - Viewing and submitting ratings  
  - Administrators can add new dishes
- **Cart**  
  - Adding/removing dishes  
  - Viewing cart contents
- **Orders**  
  - Order history  
  - Placing orders  
  - Delivery confirmation
- **Rating System**  
  - Calculation of average dish ratings  
  - Restriction: one rating per user per dish
- **Security**  
  - Prevention of duplicate accounts  
  - Role-based access control (only administrators can add dishes)
- **Configuration**  
  - JWT authentication  
  - PostgreSQL setup  
  - Database migrations

The complete list of API endpoints is available in the OpenAPI documentation after launching the project:
http://localhost:5144/swagger/index.html  

more details about Backend can be found in the backend directory

The frontend supporting this project is also available in the directory
