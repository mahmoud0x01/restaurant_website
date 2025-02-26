# Web API for an online Delivery Restaurant

## Main components :

**Account Handler**

- **Controller**: `AccountController.cs`
- **Service file**: `AuthService.cs`

```
A general user account management implementation with security practices
```

- **Register**
  `POST : /api/Account/register`
- **Login**
  `POST : /api/Account/login`
- **Logout**
  `POST : /api/Account/logout`
- **Get Profile data**
  `GET : /api/Account/profile`
- **Update Profile data**
  `PUT : /api/Account/profile`
- **Admin**: Multiplied Admin Account Creation Support
  `POST : /api/Account/register` with parameter **adminSecretKey**

**Dish items Handler**

- **Controller**: `DishController.cs`
- **Service file**: `DishService.cs`

```
Implementing Food Dish details and data as required
```

- **List all dishes with available Sorting and Filters**
  `GET : /api/Dish`
- **Getting info about specific Dish by id**
  `PUT : /api/Dish/{id}`
- **Check Rating of a dish by id**
  `GET : /api/Dish/{id}/rating/check`
- **Putting a rating to Dish by id**
  `POST : /api/Dish/{id}/rating`
- **Admin**: Creating a new Dish item in db
  `PUT : /api/Dish`

------



**Basket Handler**

- **Controller**: `BasketController.cs`
- **Service file**: `OrderService.cs`

```
Implementing Basket implementation as required
```

- **Getting basket items for authenticated user**
  `GET : /api/basket`
- **Adding dish to basket by dish id**
  `POST : /api/basket/dish/{dishId}`
- **Removing or decrementing dish from basket by dish id**
  `DELETE : /api/basket/dish/{dishId}`

------

**Order**

- **Controller**: `OrderController.cs`
- **Service file**: `OrderService.cs`

```
Implementing order implementation as required
```

- **Getting order history for authenticated user**
  `GET : /api/order`
- **Getting order details by order id for authenticated user**
  `GET : /api/order/{id}`
- **Creating a new order from available cart or basket for authenticated user**
  `POST : /api/order`
- **Confirming order delivery by order id for authenticated user**
  `POST : /api/order/{id}/status`



**more technical info about api endpoints can be seen at openapi doc url after running project . usually at :** `http://localhost:5144/swagger/index.html` 



### Other Feautures :

- **Dish Rating system**  

  `a rating system following logical rating system by calc average ratings of all users for a specific dish`

  `affecting` `GET : /api/Dish/{id}/rating/check` , `POST: /api/Dish/{id}/rating` ,`GET : /api/Dish` 

- **Business_logic_Security_Mitigations** : 

  - Same **user** cant put more than **one rating** on **same dish** . handled at  `DishService.cs` 
  - Same **user** cant be **registered** **twice**. handled at `AuthService.cs`
  - only **admin user** can create dish at `PUT: /api/Dish` . handled at ` AuthService.cs`

## Setup:

- in file **/appsettings.json** 
  - set `JwtSettings:Secret` for **JWT** authentication system secret token 
  - set `Admin:Secret` for general Admin access over the application **adminSecretKey** and to be able to create Admin Users `Account Controller -> Register -> adminSecretKey`
  - **Postgresql_config** : set values of `Host=;Database=;Username=;Password=;` according to your db user and database name on which you will work on
  
- **Migrate** files :
  - if Migration folder is empty or migration files show errors . then delete them and then you may exec in **cmd** in project folder : ` dotnet ef migrations add migration_name` to initiate a migration to be executed in db   
  - **update database structure** to create required tables and structure with **cmd** with command : `dotnet ef database update`
  
  
  
  
  
  
  
  