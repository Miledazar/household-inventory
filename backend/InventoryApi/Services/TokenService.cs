using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using InventoryApi.Models;

namespace InventoryApi.Services
{
    public class TokenService
    {
        private readonly IConfiguration _configuration;

        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(User user)
        {
            // These are the "claims" — facts the token will assert about who this is
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Us_Name)
            };

            // Turn our secret string (from appsettings.json) into a key object the signing algorithm can use
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));

            // This says HOW we'll sign — HMAC-SHA256, using our key
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Assemble the actual token: header + claims (payload) + signing instructions
            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(double.Parse(_configuration["Jwt:ExpiryMinutes"]!)),
                signingCredentials: credentials
            );

            // Convert the token object into the actual "header.payload.signature" string
            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}