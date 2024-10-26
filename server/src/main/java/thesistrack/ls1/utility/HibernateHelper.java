package thesistrack.ls1.utility;

import jakarta.persistence.Column;

import java.lang.reflect.Field;

public class HibernateHelper {
    public static String getColumnName(Class<?> entityClass, String fieldName) {
        try {
            Field field = entityClass.getDeclaredField(fieldName);
            Column column = field.getAnnotation(Column.class);
            if (column != null) {
                return column.name();
            }
            // If no Column annotation, return field name as fallback
            return fieldName;
        } catch (NoSuchFieldException e) {
            throw new RuntimeException("Field not found: " + fieldName, e);
        }
    }
}
