package za.cf.cp;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA converter to handle PostgreSQL TEXT[] arrays.
 * Converts between PostgreSQL TEXT[] and Java List<String>.
 */
@Converter
public class StringArrayConverter implements AttributeConverter<List<String>, String> {
    
    @Override
    public String convertToDatabaseColumn(List<String> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return "{}";
        }
        
        // Convert List<String> to PostgreSQL array format: {"item1","item2","item3"}
        StringBuilder sb = new StringBuilder("{");
        for (int i = 0; i < attribute.size(); i++) {
            if (i > 0) {
                sb.append(",");
            }
            String item = attribute.get(i);
            if (item != null) {
                // Escape quotes and wrap in quotes
                String escaped = item.replace("\"", "\\\"");
                sb.append("\"").append(escaped).append("\"");
            }
        }
        sb.append("}");
        return sb.toString();
    }
    
    @Override
    public List<String> convertToEntityAttribute(String dbData) {
        try {
            if (dbData == null || dbData.trim().isEmpty() || dbData.equals("{}")) {
                return new ArrayList<>();
            }
            
            // Remove outer braces and split by comma
            String content = dbData.trim();
            if (content.startsWith("{") && content.endsWith("}") && content.length() >= 2) {
                content = content.substring(1, content.length() - 1);
            }
            
            if (content.isEmpty()) {
                return new ArrayList<>();
            }
            
            // Split by comma and remove quotes
            String[] items = content.split(",");
            List<String> result = new ArrayList<>();
            
            for (String item : items) {
                String trimmed = item.trim();
                if (trimmed.startsWith("\"") && trimmed.endsWith("\"") && trimmed.length() >= 2) {
                    // Remove quotes and unescape
                    String unquoted = trimmed.substring(1, trimmed.length() - 1);
                    String unescaped = unquoted.replace("\\\"", "\"");
                    result.add(unescaped);
                } else if (!trimmed.isEmpty()) {
                    result.add(trimmed);
                }
            }
            
            return result;
        } catch (Exception e) {
            System.err.println("Error converting database TEXT[] to List<String>: " + dbData);
            System.err.println("Exception: " + e.getMessage());
            e.printStackTrace();
            // Return empty list as fallback to prevent application crash
            return new ArrayList<>();
        }
    }
} 