package thesistrack.ls1.utility;

import thesistrack.ls1.dto.LightUserDto;
import thesistrack.ls1.entity.User;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class DataFormatter {
    public static String formatDate(Object time) {
        if (!(time instanceof Instant)) {
            return "";
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy")
                .withZone(ZoneId.systemDefault());

        return formatter.format((Instant) time);
    }

    public static String formatDateTime(Object time) {
        if (!(time instanceof Instant)) {
            return "";
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss")
                .withZone(ZoneId.systemDefault());

        return formatter.format((Instant) time);
    }

    public static String formatEnum(Object value) {
        if (!value.getClass().isEnum()) {
            return "";
        }

        return ((Enum<?>) value).name();
    }

    public static String formatUsers(Object value) {
        List<LightUserDto> users = new ArrayList<>();

        if (value instanceof List) {
            for (Object element : (List<?>) value) {
                if (element instanceof LightUserDto) {
                    users.add((LightUserDto) element);
                }
            }
        }

        return String.join(" and ", users.stream().map(user -> user.firstName() + " " + user.lastName()).toList());
    }
}
