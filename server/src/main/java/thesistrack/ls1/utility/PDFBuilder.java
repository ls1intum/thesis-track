package thesistrack.ls1.utility;

import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.resolver.font.DefaultFontProvider;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.IBlockElement;
import com.itextpdf.layout.element.IElement;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.layout.properties.TextAlignment;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;

public class PDFBuilder {
    private final String heading;
    private final List<Section> sections;

    private record Section(String heading, String htmlContent) { }

    public PDFBuilder(String heading) {
        this.heading = heading;
        this.sections = new ArrayList<>();
    }

    public PDFBuilder addSection(String heading, String htmlContent) {
        sections.add(new Section(heading, htmlContent));

        return this;
    }

    public Resource build() {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        Paragraph mainHeadingParagraph = new Paragraph(heading)
                .setFontSize(24)
                .setBold()
                .setMarginBottom(20);

        document.add(mainHeadingParagraph);

        ConverterProperties converterProperties = new ConverterProperties();
        converterProperties.setFontProvider(new DefaultFontProvider(true, false, false));

        for (Section section : sections) {
            Paragraph sectionHeading = new Paragraph(section.heading)
                    .setFontSize(16)
                    .setBold()
                    .setMarginTop(10)
                    .setMarginBottom(5);
            document.add(sectionHeading);

            List<IElement> elements = HtmlConverter.convertToElements(section.htmlContent, converterProperties);
            for (IElement element : elements) {
                document.add((IBlockElement) element);
            }
        }

        document.close();

        return new ByteArrayResource(outputStream.toByteArray());
    }
}
