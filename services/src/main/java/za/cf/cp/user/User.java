package za.cf.cp.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

/**
 * User entity representing users stored in PostgreSQL.
 * Maps to the 'user' table in the database.
 * Uses firebase_uid as the primary key.
 */
@Entity
@Table(name = "\"user\"", schema = "core")
public class User extends PanacheEntityBase {
    
    @Id
    @Column(name = "firebase_uid")
    @JsonProperty("firebase_uid")
    public String firebaseUid;
    
    @Column(name = "email", nullable = false, unique = true)
    public String email;
    
    @Column(name = "username", nullable = false, unique = true)
    public String username;
    
    @Column(name = "first_name")
    @JsonProperty("first_name")
    public String firstName;
    
    @Column(name = "last_name")
    @JsonProperty("last_name")
    public String lastName;
    
    @Column(name = "display_name")
    @JsonProperty("display_name")
    public String displayName;
    
    @Column(name = "mobile")
    public String mobile;
    
    @Column(name = "rating")
    public Integer rating = 0;
    
    @Column(name = "profile_picture")
    @JsonProperty("profile_picture")
    public String profilePicture;
    
    @Column(name = "email_verified")
    @JsonProperty("email_verified")
    public Boolean emailVerified = false;
    
    @Column(name = "interests")
    @JsonProperty("interests")
    public String[] interests = new String[0];
    
    @Column(name = "profile_completed")
    @JsonProperty("profile_completed")
    public Boolean profileCompleted = false;
    
    // One-to-many relationship with UserRole
    // @OneToMany(mappedBy = "user", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    // @JsonProperty("roles")
    // public List<UserRole> roles;
    
    // Default constructor required by JPA
    public User() {}
    
    // Constructor with essential fields
    public User(String firebaseUid, String email, String username) {
        this.firebaseUid = firebaseUid;
        this.email = email;
        this.username = username;
    }
    
    // Constructor with all fields
    public User(String firebaseUid, String email, String username, String firstName, 
                String lastName, String displayName, String mobile, Integer rating, 
                String profilePicture, Boolean emailVerified) {
        this.firebaseUid = firebaseUid;
        this.email = email;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.displayName = displayName;
        this.mobile = mobile;
        this.rating = rating != null ? rating : 0;
        this.profilePicture = profilePicture;
        this.emailVerified = emailVerified != null ? emailVerified : false;
    }
    
    // Getters and setters
    public String getFirebaseUid() {
        return firebaseUid;
    }
    
    public void setFirebaseUid(String firebaseUid) {
        this.firebaseUid = firebaseUid;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
    
    public String getMobile() {
        return mobile;
    }
    
    public void setMobile(String mobile) {
        this.mobile = mobile;
    }
    
    public Integer getRating() {
        return rating;
    }
    
    public void setRating(Integer rating) {
        this.rating = rating;
    }
    
    public String getProfilePicture() {
        return profilePicture;
    }
    
    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }
    
    public Boolean getEmailVerified() {
        return emailVerified;
    }
    
    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }
    
    public String[] getInterests() {
        return interests;
    }
    
    public void setInterests(String[] interests) {
        this.interests = interests != null ? interests : new String[0];
    }
    
    public Boolean getProfileCompleted() {
        return profileCompleted;
    }
    
    public void setProfileCompleted(Boolean profileCompleted) {
        this.profileCompleted = profileCompleted != null ? profileCompleted : false;
    }
    
    // public List<UserRole> getRoles() {
    //     return roles;
    // }
    
    // public void setRoles(List<UserRole> roles) {
    //     this.roles = roles;
    // }
    
    @Override
    public String toString() {
        return "User{" +
                "firebaseUid='" + firebaseUid + '\'' +
                ", email='" + email + '\'' +
                ", username='" + username + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", displayName='" + displayName + '\'' +
                ", mobile='" + mobile + '\'' +
                ", rating=" + rating +
                ", profilePicture='" + profilePicture + '\'' +
                ", emailVerified=" + emailVerified +
                ", interests=" + java.util.Arrays.toString(interests) +
                ", profileCompleted=" + profileCompleted +
                // ", roles=" + (roles != null ? roles.size() : "null") +
                '}';
    }
} 