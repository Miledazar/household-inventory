using Microsoft.AspNetCore.Mvc;
using InventoryApi.Interfaces;
using InventoryApi.Models;
using InventoryApi.Models.Dtos;
using InventoryApi.Services;
using BCrypt.Net;


namespace InventoryApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly TokenService _tokenService;
        private readonly UserInitializationService _userInitializationService;

        public AuthController(IUserRepository userRepository, TokenService tokenService, UserInitializationService userInitializationService)
        {
            _userRepository = userRepository;
            _tokenService = tokenService;
            _userInitializationService = userInitializationService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var existing = await _userRepository.GetByNameAsync(dto.Name);
            if (existing != null)
                return BadRequest("Username already taken.");

            var user = new User
            {
                Us_Name = dto.Name,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };
            user.Id = await _userRepository.CreateAsync(user);

            await _userInitializationService.SeedDefaultAsync(user.Id);

            var token = _tokenService.GenerateToken(user);
            return Ok(new AuthResponseDto { Token = token, UserId = user.Id, Name = user.Us_Name });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _userRepository.GetByNameAsync(dto.Name);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Invalid name or password.");

            var token = _tokenService.GenerateToken(user);
            return Ok(new AuthResponseDto { Token = token, UserId = user.Id, Name = user.Us_Name });
        }
    }
}