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

import com.itextpdf.layout.element.Text;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;

public class PDFBuilder {
    private final String heading;
    private final List<Section> sections;
    private final List<Data> data;

    private record Data(String title, String value) { }
    private record Section(String heading, String htmlContent) { }

    public PDFBuilder(String heading) {
        this.heading = heading;
        this.sections = new ArrayList<>();
        this.data = new ArrayList<>();
    }

    public PDFBuilder addData(String title, String value) {
        data.add(new Data(title, value));

        return this;
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
                .setFontSize(20)
                .simulateBold()
                .setMarginBottom(16);

        document.add(mainHeadingParagraph);

        ConverterProperties converterProperties = new ConverterProperties();
        converterProperties.setFontProvider(new DefaultFontProvider(true, false, false));

        for (Data row : data) {
            Paragraph element = new Paragraph()
                    .setFontSize(10)
                    .setMarginBottom(2);

            if (row.title.isEmpty()) {
                element.add(new Text(""));
            } else {
                element.add(new Text(row.title + ": ").simulateBold())
                        .add(new Text(row.value));
            }

            document.add(element);
        }

        for (Section row : sections) {
            Paragraph sectionHeading = new Paragraph(row.heading)
                    .setFontSize(12)
                    .simulateBold()
                    .setMarginTop(8);
            document.add(sectionHeading);

            List<IElement> elements = HtmlConverter.convertToElements(row.htmlContent, converterProperties);
            for (IElement element : elements) {
                document.add((IBlockElement) element);
            }
        }

        document.close();

        return new ByteArrayResource(outputStream.toByteArray());
    }
}
