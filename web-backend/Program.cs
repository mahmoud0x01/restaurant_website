// Program.cs
using Mahmoud_Restaurant.Configurations;
using Mahmoud_Restaurant.Data;
using Mahmoud_Restaurant.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NSwag;
using NSwag.AspNetCore;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Reflection;
using System.Text;
using Swashbuckle.AspNetCore.Annotations;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
builder.Services.AddSingleton(new ConcurrentDictionary<string, DateTime>()); // For token blacklist
builder.Services.AddScoped<AuthService>((serviceProvider) =>
{
    var context = serviceProvider.GetRequiredService<ApplicationDbContext>();
    var jwtSecret = builder.Configuration.GetValue<string>("JwtSettings:Secret");
    var adminSecretKey = builder.Configuration.GetValue<string>("Admin:Secret");
    var tokenBlacklist = serviceProvider.GetRequiredService<ConcurrentDictionary<string, DateTime>>();
    return new AuthService(context, jwtSecret, adminSecretKey, tokenBlacklist);
});
builder.Services.AddScoped<DishService>((serviceProvider) =>
{
    var context = serviceProvider.GetRequiredService<ApplicationDbContext>();
    var jwtSecret = builder.Configuration.GetValue<string>("JwtSettings:Secret");
    var adminSecretKey = builder.Configuration.GetValue<string>("Admin:Secret");
    var tokenBlacklist = serviceProvider.GetRequiredService<ConcurrentDictionary<string, DateTime>>();
    return new DishService(context, jwtSecret, adminSecretKey, tokenBlacklist);
});
builder.Services.AddScoped<OrderService>((serviceProvider) =>
{
    var context = serviceProvider.GetRequiredService<ApplicationDbContext>();
    return new OrderService(context);
});
// Token Validation with Blacklist Check
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
        ValidateIssuer = false,
        ValidateAudience = false,
        // Example of accessing AuthService for custom validation
        LifetimeValidator = (notBefore, expires, token, parameters) =>
        {
            var serviceProvider = builder.Services.BuildServiceProvider();
            var authService = serviceProvider.GetRequiredService<AuthService>();
            // Use authService to validate if token is blacklisted
            return !authService.IsTokenBlacklisted(token.Id);
        }
    };
});

// Register services
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    });


// Configure Swagger/OpenAPI
builder.Services.AddOpenApiDocument(config =>
{
    // Set general API information
    config.PostProcess = document =>
    {
        document.Info.Version = "v1";
        document.Info.Title = "Mahmoud Restaurant API";
        document.Info.Description = "API for Mahmoud Restaurant.";
    };
    config.AddSecurity("JWT", Enumerable.Empty<string>(), new NSwag.OpenApiSecurityScheme
    {
        Type = OpenApiSecuritySchemeType.ApiKey,
        Name = "Authorization",
        In = OpenApiSecurityApiKeyLocation.Header,
        Description = "Enter 'Bearer' [space] and then your token"
    });
    // Use the updated custom processor to apply security only where required
    config.OperationProcessors.Add(new AuthorizeSecurityProcessor());
});
// Use NSwag middleware to serve Swagger UI
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Home/Error");
}

app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.UseOpenApi();       // Enable serving OpenAPI JSON
app.UseSwaggerUi();    // Enable Swagger UI

app.MapControllers();

app.Run();
