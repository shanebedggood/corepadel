package za.cf.cp.venue.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

/**
 * DTO for venue data transfer.
 */
public class VenueDto {
    
    @JsonProperty("id")
    public String id;
    
    @JsonProperty("name")
    public String name;
    
    @JsonProperty("website")
    public String website;
    
    @JsonProperty("facilities")
    public String facilities;
    
    @JsonProperty("address")
    public AddressDto address;
    


    // Default constructor
    public VenueDto() {}

    // Constructor with required fields
    public VenueDto(String name, AddressDto address) {
        this.name = name;
        this.address = address;
    }

    // Getters and setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public String getFacilities() {
        return facilities;
    }

    public void setFacilities(String facilities) {
        this.facilities = facilities;
    }

    public AddressDto getAddress() {
        return address;
    }

    public void setAddress(AddressDto address) {
        this.address = address;
    }



    @Override
    public String toString() {
        return "VenueDto{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", website='" + website + '\'' +
                ", facilities='" + facilities + '\'' +
                ", address=" + address +
                '}';
    }

    /**
     * DTO for address data transfer.
     */
    public static class AddressDto {
        
        @JsonProperty("street")
        public String street;
        
        @JsonProperty("suburb")
        public String suburb;
        
        @JsonProperty("city")
        public String city;
        
        @JsonProperty("province")
        public String province;
        
        @JsonProperty("postalCode")
        public String postalCode;
        
        @JsonProperty("country")
        public String country;

        // Default constructor
        public AddressDto() {}

        // Constructor with required fields
        public AddressDto(String street, String city, String country) {
            this.street = street;
            this.city = city;
            this.country = country;
        }

        // Constructor with all fields
        public AddressDto(String street, String suburb, String city, String province, String postalCode, String country) {
            this.street = street;
            this.suburb = suburb;
            this.city = city;
            this.province = province;
            this.postalCode = postalCode;
            this.country = country;
        }

        // Getters and setters
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
            return "AddressDto{" +
                    "street='" + street + '\'' +
                    ", suburb='" + suburb + '\'' +
                    ", city='" + city + '\'' +
                    ", province='" + province + '\'' +
                    ", postalCode='" + postalCode + '\'' +
                    ", country='" + country + '\'' +
                    '}';
        }
    }
} 