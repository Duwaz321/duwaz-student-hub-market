package org.example.duwaz.dto;

public class AuthResponse {
    private String token;
    private Long userId;
    private String studentName;
    private String email;

    public AuthResponse(String token, Long userId, String studentName, String email) {
        this.token = token;
        this.userId = userId;
        this.studentName = studentName;
        this.email = email;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
