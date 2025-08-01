package za.cf.cp.venue;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.util.UUID;

/**
 * Address entity representing addresses stored in PostgreSQL.
 * Maps to the 'address' table in the database.
 */
@Entity
@Table(name = "address", schema = "core")
public class Address extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "address_id")
    @JsonProperty("address_id")
    public UUID addressId;

    @Column(name = "street", nullable = false)
    @JsonProperty("street")
    public String street;

    @Column(name = "suburb")
    @JsonProperty("suburb")
    public String suburb;

    @Column(name = "city", nullable = false)
    @JsonProperty("city")
    public String city;

    @Column(name = "province")
    @JsonProperty("province")
    public String province;

    @Column(name = "postal_code")
    @JsonProperty("postal_code")
    public String postalCode;

    @Column(name = "country", nullable = false)
    @JsonProperty("country")
    public String country;

    // Default constructor
    public Address() {}

    // Constructor with required fields
    public Address(String street, String city, String country) {
        this.street = street;
        this.city = city;
        this.country = country;
    }

    // Constructor with all fields
    public Address(String street, String suburb, String city, String province, String postalCode, String country) {
        this.street = street;
        this.suburb = suburb;
        this.city = city;
        this.province = province;
        this.postalCode = postalCode;
        this.country = country;
    }

    // Getters and setters
    public UUID getAddressId() {
        return addressId;
    }

    public void setAddressId(UUID addressId) {
        this.addressId = addressId;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getSuburb() {
        return suburb;
    }

    public void setSuburb(String suburb) {
        this.suburb = suburb;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    @Override
    public String toString() {
        return "Address{" +
                "addressId=" + addressId +
                ", street='" + street + '\'' +
                ", suburb='" + suburb + '\'' +
                ", city='" + city + '\'' +
                ", province='" + province + '\'' +
                ", postalCode='" + postalCode + '\'' +
                ", country='" + country + '\'' +
                '}';
    }
} 