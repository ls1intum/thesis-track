package thesistrack.ls1.utility;

import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class StringToArrayConverter implements Converter<String, String[]> {
    private static final String DEFAULT_SEPARATOR = ",";

    @Override
    public String[] convert(String source) {
        if (source.isEmpty()) {
            return new String[0];
        }

        List<String> filteredList = Arrays.stream(source.split(DEFAULT_SEPARATOR))
                .filter(str -> !str.isEmpty())
                .toList();

        return filteredList.toArray(new String[0]);
    }
}