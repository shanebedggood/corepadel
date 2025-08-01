package za.cf.cp.tournament;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;
import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.*;

/**
 * Test class for TournamentConfigResource endpoints.
 */
@QuarkusTest
public class TournamentConfigResourceTest {
    
    @Test
    public void testGetTournamentConfig() {
        given()
            .when()
                .get("/api/tournament-config")
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("formats", notNullValue())
                .body("statuses", notNullValue())
                .body("categories", notNullValue())
                .body("registrationTypes", notNullValue())
                .body("venueTypes", notNullValue())
                .body("lastUpdated", notNullValue());
    }
    
    @Test
    public void testGetRoundRobinConfig() {
        given()
            .when()
                .get("/api/tournament-config/round-robin")
            .then()
                .statusCode(200)
                .contentType(ContentType.JSON)
                .body("progressionTypes", notNullValue())
                .body("groupAdvancementSettings", notNullValue())
                .body("combinedAdvancementSettings", notNullValue())
                .body("lastUpdated", notNullValue());
    }
    
    @Test
    public void testHealthEndpoint() {
        given()
            .when()
                .get("/api/tournament-config/health")
            .then()
                .statusCode(200)
                .body(containsString("Tournament configuration service is running"));
    }
} 