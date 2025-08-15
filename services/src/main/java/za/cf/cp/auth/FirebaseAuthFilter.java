package za.cf.cp.auth;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriInfo;
import io.vertx.ext.web.RoutingContext;
import org.jboss.resteasy.reactive.server.ServerRequestFilter;

import java.util.Arrays;
import java.util.List;

/**
 * Simple authentication filter for Firebase ID tokens
 * For now, this just checks for the presence of a token without validation
 * In production, you would want to validate the Firebase ID token properly
 */
@ApplicationScoped
public class FirebaseAuthFilter {

    @Context
    UriInfo uriInfo;

    @Context
    RoutingContext routingContext;

    // List of paths that don't require authentication
    private static final List<String> PUBLIC_PATHS = Arrays.asList(
        "/api/health",
        "/api/users/health",
        "/api/users/firebase/",
        "/api/users",
        "/api/tournaments",
        "/api/tournament-config",
        "/swagger-ui",
        "/swagger-ui/",
        "/q/swagger-ui",
        "/openapi"
    );

    @ServerRequestFilter(preMatching = true, priority = Priorities.AUTHENTICATION - 1)
    public Response filter(ContainerRequestContext requestContext) {
        String method = requestContext.getMethod();
        String path = uriInfo.getPath();
        
        System.out.println("Firebase Auth filter processing path: " + path);
        System.out.println("Firebase Auth filter - HTTP method: " + method);
        
        // If this is a CORS preflight request, skip auth so that browser can proceed
        if ("OPTIONS".equalsIgnoreCase(method)) {
            System.out.println("CORS preflight detected (OPTIONS) - skipping authentication for path: " + path);
            return null;
        }
        
        // Skip authentication for public paths
        if (isPublicPath(path)) {
            System.out.println("Skipping authentication for public path: " + path);
            return null;
        }

        // Get the Authorization header
        String authHeader = requestContext.getHeaderString(HttpHeaders.AUTHORIZATION);
        if (authHeader == null) {
            // Try lowercase key just in case
            authHeader = requestContext.getHeaders().getFirst("authorization");
        }
        if (authHeader == null) {
            // Try debug header
            authHeader = requestContext.getHeaderString("X-Authorization");
        }
        if (authHeader == null && routingContext != null) {
            // As a fallback, read from the raw Vert.x request
            String rawUpper = routingContext.request().getHeader("Authorization");
            String rawLower = routingContext.request().getHeader("authorization");
            String rawX = routingContext.request().getHeader("X-Authorization");
            authHeader = rawUpper != null ? rawUpper : (rawLower != null ? rawLower : rawX);
        }
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.err.println("Missing or invalid Authorization header for path: " + path);
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\": \"Missing or invalid Authorization header\"}")
                    .type("application/json")
                    .build();
        }

        // Extract the token
        String token = authHeader.substring("Bearer ".length());
        System.out.println("Firebase Auth filter - Token length: " + token.length());
        System.out.println("Firebase Auth filter - Token preview: " + token.substring(0, Math.min(50, token.length())) + "...");
        
        // For now, just check if token exists (basic validation)
        if (token == null || token.isEmpty()) {
            System.err.println("Empty token for path: " + path);
            return Response.status(Response.Status.UNAUTHORIZED)
                    .entity("{\"error\": \"Empty token\"}")
                    .type("application/json")
                    .build();
        }

        // TODO: In production, validate the Firebase ID token here
        // For now, we'll just accept any non-empty token
        
        System.out.println("Firebase Authentication successful for path: " + path);
        return null;
    }

    /**
     * Check if the path is public (doesn't require authentication)
     */
    private boolean isPublicPath(String path) {
        System.out.println("Checking if path is public: " + path);
        boolean isPublic = PUBLIC_PATHS.stream().anyMatch(publicPath -> {
            boolean matches = path.startsWith(publicPath);
            System.out.println("  Checking against public path: " + publicPath + " -> " + matches);
            return matches;
        });
        System.out.println("Path " + path + " is public: " + isPublic);
        return isPublic;
    }
}
