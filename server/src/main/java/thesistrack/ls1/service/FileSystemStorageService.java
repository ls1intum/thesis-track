package thesistrack.ls1.service;

import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import thesistrack.ls1.exception.StorageException;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.UUID;
import java.util.stream.Stream;

@Service
public class FileSystemStorageService {

    public boolean writeToFile(final Path rootLocation, final String filename, final String contents) {
        try {
            final File uploadDirectory = rootLocation.toFile();
            if (!uploadDirectory.exists()) {
                uploadDirectory.mkdirs();
            }

            String decodedContents = URLDecoder.decode(contents, "UTF-8");
            Files.write(rootLocation.resolve(filename), decodedContents.getBytes());
            return true;
        }
        catch (final IOException e) {
            throw new StorageException("Failed to write to file.", e);
        }
    }

    public String readFromFile(final Path rootLocation, final String filename) throws StorageException {
        Path filePath = rootLocation.resolve(filename);
        try {
            byte[] fileBytes = Files.readAllBytes(filePath);
            return new String(fileBytes, "UTF-8");
        } catch (IOException e) {
            throw new StorageException("Failed to read from file.", e);
        }
    }

    public String store(final Path rootLocation, final MultipartFile file) {
        try {

            final File uploadDirectory = rootLocation.toFile();
            if (!uploadDirectory.exists()) {
                uploadDirectory.mkdirs();
            }

            if (file.isEmpty()) {
                throw new StorageException("Failed to store empty file.");
            }
            final String filename = StringUtils.cleanPath(UUID.randomUUID() + "-" + file.getOriginalFilename());
            if (filename.contains("..")) {
                throw new StorageException(
                        "Cannot store file with relative path outside current directory "
                                + filename);
            }
            try (final InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, rootLocation.resolve(filename),
                        StandardCopyOption.REPLACE_EXISTING);
                return filename;
            }
        }
        catch (final IOException e) {
            throw new StorageException("Failed to store file.", e);
        }
    }

    public Stream<Path> loadAll(final Path rootLocation) {
        try {
            return Files.walk(rootLocation, 1)
                    .filter(path -> !path.equals(rootLocation))
                    .map(rootLocation::relativize);
        }
        catch (final IOException e) {
            throw new StorageException("Failed to read stored files", e);
        }
    }

    public FileSystemResource load(final Path rootLocation, final String filename) {
        return new FileSystemResource(rootLocation.resolve(filename));
    }

    public void deleteAll(final Path rootLocation) {
        FileSystemUtils.deleteRecursively(rootLocation.toFile());
    }

    public void init(final Path... rootLocations) {
        Arrays.stream(rootLocations).forEach(
                rootLocation -> {
                    try {
                        Files.createDirectories(rootLocation);
                    }
                    catch (final IOException e) {
                        throw new StorageException("Could not initialize storage", e);
                    }
                });
    }
}
