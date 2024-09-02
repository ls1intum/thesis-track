package thesistrack.ls1.utility;

import org.hibernate.SessionFactory;
import org.hibernate.internal.SessionFactoryImpl;
import org.hibernate.persister.entity.AbstractEntityPersister;
import org.hibernate.persister.entity.EntityPersister;

public class HibernateHelper {
    public static String getColumnName(SessionFactory sessionFactory, Class<?> entityClass, String attributeName) {
        SessionFactoryImpl sessionFactoryImpl = sessionFactory.unwrap(SessionFactoryImpl.class);
        EntityPersister entityPersister = sessionFactoryImpl.getMetamodel().entityPersister(entityClass);

        if (entityPersister instanceof AbstractEntityPersister persister) {
            String[] columnNames = persister.getPropertyColumnNames(attributeName);

            if (columnNames.length > 0) {
                return columnNames[0];
            }
        }

        throw new RuntimeException("Attribute '" + attributeName + "' not found on entity class " + entityClass.getName());
    }
}
