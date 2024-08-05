package thesistrack.ls1.service;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import thesistrack.ls1.exception.UploadException;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Service
public class UploadService {
    private final Path rootLocation;

    @Autowired
    public UploadService(@Value("${thesis-track.storage.upload-location}") String uploadLocation) {
        this.rootLocation = Paths.get(uploadLocation);

        File uploadDirectory = rootLocation.toFile();

        if (!uploadDirectory.exists() && !uploadDirectory.mkdirs()) {
            throw new UploadException("Failed to create upload directory");
        }
    }

    public String store(MultipartFile file, Integer maxSize) {
        try {
            if (file.isEmpty()) {
                throw new UploadException("Failed to store empty file");
            }

            if (file.getSize() > maxSize) {
                throw new UploadException("File size exceeds the maximum allowed size");
            }

            String originalFilename = file.getOriginalFilename();
            String extension = FilenameUtils.getExtension(originalFilename);

            String filename = StringUtils.cleanPath(computeFileHash(file) + "." + extension);

            if (filename.contains("..")) {
                throw new UploadException("Cannot store file with relative path outside current directory");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, rootLocation.resolve(filename), StandardCopyOption.REPLACE_EXISTING);

                return filename;
            }
        }
        catch (IOException | NoSuchAlgorithmException e) {
            throw new UploadException("Failed to store file", e);
        }
    }

    public FileSystemResource load(String filename) {
        try {
            if (filename.contains("..")) {
                throw new UploadException("Cannot load file with relative path outside current directory");
            }

            FileSystemResource file =  new FileSystemResource(rootLocation.resolve(filename));

            file.contentLength();

            return file;
        } catch (IOException e) {
            throw new UploadException("Failed to load file", e);
        }
    }

    private String computeFileHash(MultipartFile file) throws IOException, NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (InputStream inputStream = file.getInputStream()) {
            byte[] fileBytes = IOUtils.toByteArray(inputStream);
            byte[] hashBytes = digest.digest(fileBytes);

            return HexFormat.of().formatHex(hashBytes);
        }
    }
}
