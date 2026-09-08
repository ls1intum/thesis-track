package de.tum.cit.aet.thesis.core.utility;

import static org.assertj.core.api.Assertions.assertThat;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfPage;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.PdfCanvas;
import org.junit.jupiter.api.Test;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;

class AbstractExtractorTest {

	private static final float MARGIN_X = 56f;

	/** A single line of text drawn at an absolute baseline position with a given font size. */
	private record Line(String text, float fontSize, float y) {
	}

	/** Builds a one-page PDF placing each line at its exact baseline so layout is fully controlled. */
	private static byte[] buildPdf(List<Line> lines) {
		try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			try (PdfDocument pdf = new PdfDocument(new PdfWriter(out))) {
				PdfPage page = pdf.addNewPage();
				PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);
				PdfCanvas canvas = new PdfCanvas(page);

				for (Line line : lines) {
					canvas.beginText()
							.setFontAndSize(font, line.fontSize())
							.moveText(MARGIN_X, line.y())
							.showText(line.text())
							.endText();
				}
			}
			return out.toByteArray();
		} catch (Exception e) {
			throw new RuntimeException("Failed to build test PDF", e);
		}
	}

	/** A line drawn at an explicit left x, so first-line indentation can be simulated. */
	private record PlacedLine(String text, float fontSize, float x, float y) {
	}

	/** Builds a one-page PDF placing each line at its exact x/baseline. */
	private static byte[] buildPlacedPdf(List<PlacedLine> lines) {
		try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			try (PdfDocument pdf = new PdfDocument(new PdfWriter(out))) {
				PdfCanvas canvas = new PdfCanvas(pdf.addNewPage());
				PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);
				for (PlacedLine line : lines) {
					canvas.beginText()
							.setFontAndSize(font, line.fontSize())
							.moveText(line.x(), line.y())
							.showText(line.text())
							.endText();
				}
			}
			return out.toByteArray();
		} catch (Exception e) {
			throw new RuntimeException("Failed to build test PDF", e);
		}
	}

	@Test
	void extract_indentedParagraphsWithoutExtraGap_areSplit() {
		// LaTeX-style abstracts separate paragraphs by a first-line indent, not vertical space,
		// so a gap-only detector would merge them. The indent must start a new paragraph.
		float left = 56f;
		float indent = 74f;
		byte[] pdf = buildPlacedPdf(List.of(
				new PlacedLine("Abstract", 14f, left, 780f),
				new PlacedLine("First paragraph line one runs across the column to the margin.", 11f, indent, 752f),
				new PlacedLine("first paragraph line two returns to the left margin here.", 11f, left, 737f),
				new PlacedLine("Second paragraph begins with an indent on its first line here.", 11f, indent, 722f),
				new PlacedLine("second paragraph line two returns to the left margin again.", 11f, left, 707f),
				new PlacedLine("1 Introduction", 14f, left, 680f)
		));

		AbstractExtractor.Result result = AbstractExtractor.extract(pdf);

		assertThat(result.html())
				.contains("<p>First paragraph line one runs across the column to the margin. "
						+ "first paragraph line two returns to the left margin here.</p>")
				.contains("<p>Second paragraph begins with an indent on its first line here. "
						+ "second paragraph line two returns to the left margin again.</p>");
	}

	@Test
	void extract_modestParagraphGapWithoutIndent_areSplit() {
		// Word-style abstracts often add only a little extra space between flush-left paragraphs
		// (well under 1.5x the line gap). That modest gap must still start a new <p>.
		byte[] pdf = buildPdf(List.of(
				new Line("Abstract", 14f, 780f),
				new Line("First paragraph runs across the full column width with plenty of words here.", 11f, 750f),
				new Line("It continues onto a second line that also fills most of the column width.", 11f, 735f),
				new Line("Second paragraph starts after only a modest vertical gap without indent.", 11f, 715f),
				new Line("It also continues so the body has a clear typical intra-paragraph gap.", 11f, 700f),
				new Line("1 Introduction", 14f, 670f)
		));

		AbstractExtractor.Result result = AbstractExtractor.extract(pdf);

		assertThat(result.html())
				.contains("<p>First paragraph runs across the full column width with plenty of words here. "
						+ "It continues onto a second line that also fills most of the column width.</p>")
				.contains("<p>Second paragraph starts after only a modest vertical gap without indent. "
						+ "It also continues so the body has a clear typical intra-paragraph gap.</p>");
	}

	@Test
	void extract_shortLastLineSentenceBreak_splitsFlushParagraphs() {
		// Flush-left, identical leading: the only cue is a short last line that ends a sentence.
		byte[] pdf = buildPdf(List.of(
				new Line("Abstract", 14f, 780f),
				new Line("This opening line is deliberately long so it defines the full column width clearly.", 11f, 750f),
				new Line("Short end.", 11f, 735f),
				new Line("Next paragraph begins here with a capital and should stand alone in HTML.", 11f, 720f),
				new Line("1 Introduction", 14f, 690f)
		));

		AbstractExtractor.Result result = AbstractExtractor.extract(pdf);

		assertThat(result.html())
				.contains("<p>This opening line is deliberately long so it defines the full column width clearly. "
						+ "Short end.</p>")
				.contains("<p>Next paragraph begins here with a capital and should stand alone in HTML.</p>");
	}

	@Test
	void extract_fullWidthSentenceWrap_doesNotSplitMidParagraph() {
		// A mid-paragraph wrap after a period on a full-width line must stay in one <p>.
		byte[] pdf = buildPdf(List.of(
				new Line("Abstract", 14f, 780f),
				new Line("We evaluate several baselines and report the main results. Additional", 11f, 750f),
				new Line("detail about the setup follows in this same paragraph without a break.", 11f, 735f),
				new Line("1 Introduction", 14f, 700f)
		));

		AbstractExtractor.Result result = AbstractExtractor.extract(pdf);

		assertThat(result.html()).isEqualTo(
				"<p>We evaluate several baselines and report the main results. Additional "
						+ "detail about the setup follows in this same paragraph without a break.</p>");
	}

	@Test
	void extract_clearAbstractWithIntroductionBoundary_returnsConfidentDehyphenatedParagraphs() {
		byte[] pdf = buildPdf(List.of(
				new Line("Abstract", 14f, 780f),
				new Line("This paper presents a com-", 11f, 750f),
				new Line("prehensive study of ab-", 11f, 735f),
				new Line("stract extraction from PDFs.", 11f, 720f),
				new Line("A second paragraph adds more detail.", 11f, 690f),
				new Line("1 Introduction", 14f, 655f),
				new Line("Body text of the introduction section.", 11f, 630f)
		));

		AbstractExtractor.Result result = AbstractExtractor.extract(pdf);

		assertThat(result.confidence()).isEqualTo(AbstractExtractor.Confidence.CONFIDENT);
		assertThat(result.html()).isEqualTo(
				"<p>This paper presents a comprehensive study of abstract extraction from PDFs.</p>"
						+ "<p>A second paragraph adds more detail.</p>");
	}

	@Test
	void extract_noAbstractHeading_returnsNone() {
		byte[] pdf = buildPdf(List.of(
				new Line("1 Introduction", 14f, 780f),
				new Line("This document has no abstract section at all.", 11f, 750f)
		));

		AbstractExtractor.Result result = AbstractExtractor.extract(pdf);

		assertThat(result.confidence()).isEqualTo(AbstractExtractor.Confidence.NONE);
		assertThat(result.html()).isNullOrEmpty();
	}

	@Test
	void extract_germanHeadingOnly_returnsNoneBecauseEnglishOnly() {
		byte[] pdf = buildPdf(List.of(
				new Line("Zusammenfassung", 14f, 780f),
				new Line("Diese Arbeit untersucht die Extraktion von Abstracts.", 11f, 750f),
				new Line("1 Einleitung", 14f, 715f)
		));

		AbstractExtractor.Result result = AbstractExtractor.extract(pdf);

		assertThat(result.confidence()).isEqualTo(AbstractExtractor.Confidence.NONE);
	}

	@Test
	void extract_abstractTooLong_returnsUncertain() {
		StringBuilder filler = new StringBuilder();
		for (int i = 0; i < 60; i++) {
			filler.append("This sentence pads the abstract well beyond the confident length cap. ");
		}

		byte[] pdf = buildPdf(List.of(
				new Line("Abstract", 14f, 780f),
				new Line(filler.toString(), 11f, 750f),
				new Line("1 Introduction", 14f, 715f)
		));

		AbstractExtractor.Result result = AbstractExtractor.extract(pdf);

		assertThat(result.confidence()).isEqualTo(AbstractExtractor.Confidence.UNCERTAIN);
		assertThat(result.html()).contains("<p>");
	}

	@Test
	void extract_dropsFootnoteDefinitionLines() {
		// Footnotes sit at the page bottom in a smaller font and begin with a superscript marker;
		// their text (often URLs) must not leak into the abstract.
		String sup1 = String.valueOf((char) 0x00B9);
		byte[] pdf = buildPdf(List.of(
				new Line("Abstract", 14f, 780f),
				new Line("This thesis presents a system that is described here in the abstract body.", 11f, 750f),
				new Line(sup1 + "OpenAI Whisper: https://github.com/openai/whisper", 8f, 715f),
				new Line("1 Introduction", 14f, 690f)
		));

		AbstractExtractor.Result result = AbstractExtractor.extract(pdf);

		assertThat(result.html())
				.contains("This thesis presents a system")
				.doesNotContain("Whisper")
				.doesNotContain("github");
	}

	@Test
	void extract_sectionNumberedAbstractHeading_isFound() {
		// Some proposals number the abstract as a section, e.g. "1. Abstract".
		byte[] pdf = buildPdf(List.of(
				new Line("1. Abstract", 14f, 780f),
				new Line("This proposal describes the planned work in enough detail to be valid.", 11f, 750f),
				new Line("2. Introduction", 14f, 715f)
		));

		AbstractExtractor.Result result = AbstractExtractor.extract(pdf);

		assertThat(result.confidence()).isEqualTo(AbstractExtractor.Confidence.CONFIDENT);
		assertThat(result.html()).contains("This proposal describes the planned work");
	}

	@Test
	void extract_abstractHeadingButNoBoundary_returnsUncertain() {
		byte[] pdf = buildPdf(List.of(
				new Line("Summary", 14f, 780f),
				new Line("A short summary with no following section heading to bound it.", 11f, 750f)
		));

		AbstractExtractor.Result result = AbstractExtractor.extract(pdf);

		assertThat(result.confidence()).isEqualTo(AbstractExtractor.Confidence.UNCERTAIN);
	}

	@Test
	void extract_lineEndHyphenBeforeUppercase_keepsHyphen() {
		byte[] pdf = buildPdf(List.of(
				new Line("Abstract", 14f, 780f),
				new Line("We evaluate the system on Industry-", 11f, 750f),
				new Line("4.0 manufacturing data sets in detail here.", 11f, 735f),
				new Line("1 Introduction", 14f, 700f)
		));

		AbstractExtractor.Result result = AbstractExtractor.extract(pdf);

		assertThat(result.html())
				.as("Expected hyphen kept before an uppercase/digit continuation")
				.contains("Industry-4.0");
	}

	@Test
	void extract_abstractOnSixthPageAfterFrontMatter_isFound() {
		// Real theses follow a template: title, declaration, acknowledgements, then the
		// abstract around page 6 — well beyond a five-page scan window.
		List<List<Line>> pages = new ArrayList<>();
		pages.add(List.of(new Line("Thesis Title Page", 20f, 700f)));
		pages.add(List.of(new Line("Statutory declaration text.", 11f, 700f)));
		pages.add(List.of(new Line("Acknowledgements", 14f, 760f),
				new Line("I would like to thank my advisor.", 11f, 730f)));
		pages.add(List.of(new Line("More acknowledgements text.", 11f, 700f)));
		pages.add(List.of(new Line("Table of figures placeholder.", 11f, 700f)));
		pages.add(List.of(
				new Line("Abstract", 14f, 780f),
				new Line("This thesis presents a faithful approach to extracting", 11f, 750f),
				new Line("the abstract from a multi-page thesis document reliably.", 11f, 735f),
				new Line("Zusammenfassung", 14f, 695f)));

		AbstractExtractor.Result result = AbstractExtractor.extract(buildMultiPagePdf(pages));

		assertThat(result.confidence()).isEqualTo(AbstractExtractor.Confidence.CONFIDENT);
		assertThat(result.html())
				.contains("This thesis presents a faithful approach to extracting the abstract "
						+ "from a multi-page thesis document reliably.")
				.doesNotContain("Zusammenfassung");
	}

	@Test
	void extract_stopsAtSameSizeZusammenfassungHeading() {
		// In real theses the German "Zusammenfassung" heading is set at the same point size as the
		// body, so it must be recognised as a boundary by name, not by being larger than the body.
		byte[] pdf = buildPdf(List.of(
				new Line("Abstract", 14f, 780f),
				new Line("This English abstract is long enough to satisfy the confident floor.", 11f, 750f),
				new Line("Zusammenfassung", 11f, 720f),
				new Line("Diese deutsche Zusammenfassung darf nicht im Ergebnis erscheinen.", 11f, 695f)
		));

		AbstractExtractor.Result result = AbstractExtractor.extract(pdf);

		assertThat(result.confidence()).isEqualTo(AbstractExtractor.Confidence.CONFIDENT);
		assertThat(result.html())
				.contains("This English abstract is long enough to satisfy the confident floor.")
				.doesNotContain("deutsche")
				.doesNotContain("Zusammenfassung");
	}

	@Test
	void normalizeHyphens_replacementCharGlyphBecomesHyphen() {
		// Real thesis fonts decode their hyphen glyph as U+FFFD; it must become a plain hyphen so
		// an intra-line compound keeps the hyphen and a line-end break can later rejoin.
		String repl = String.valueOf((char) 0xFFFD);
		assertThat(AbstractExtractor.normalizeHyphens("open" + repl + "source")).isEqualTo("open-source");
		assertThat(AbstractExtractor.normalizeHyphens("com" + repl)).isEqualTo("com-");
	}

	@Test
	void normalizeHyphens_softHyphenBecomesHardHyphen() {
		String soft = String.valueOf((char) 0x00AD);
		// Trailing soft hyphen becomes a hard hyphen so the line-join rejoin can remove it.
		assertThat(AbstractExtractor.normalizeHyphens("auto" + soft)).isEqualTo("auto-");
		// Mid-word soft hyphens preserve compounds (LaTeX discretionary hyphens in real theses).
		assertThat(AbstractExtractor.normalizeHyphens("role" + soft + "sensitive"))
				.isEqualTo("role-sensitive");
		assertThat(AbstractExtractor.normalizeHyphens("guideline" + soft + "based"))
				.isEqualTo("guideline-based");
	}

	@Test
	void extract_trailingSoftHyphen_rejoinsAcrossLineBreak() {
		// LaTeX inserts a soft hyphen (U+00AD) at the break point of a hyphenated word.
		String soft = String.valueOf((char) 0x00AD);
		byte[] pdf = buildPdf(List.of(
				new Line("Abstract", 14f, 780f),
				new Line("We study auto" + soft, 11f, 750f),
				new Line("mated extraction of abstracts in considerable depth here today.", 11f, 735f),
				new Line("1 Introduction", 14f, 700f)
		));

		AbstractExtractor.Result result = AbstractExtractor.extract(pdf);

		assertThat(result.html()).contains("automated").doesNotContain(soft);
	}

	@Test
	void extract_midWordSoftHyphen_keepsCompoundHyphen() {
		// Real theses often encode compounds with a soft hyphen mid-line; dropping it would glue
		// the parts together ("rolesensitive"). It must become a visible hard hyphen.
		String soft = String.valueOf((char) 0x00AD);
		byte[] pdf = buildPdf(List.of(
				new Line("Abstract", 14f, 780f),
				new Line("We implement a role" + soft + "sensitive workflow with guideline"
						+ soft + "based review for this evaluation.", 11f, 750f),
				new Line("1 Introduction", 14f, 720f)
		));

		AbstractExtractor.Result result = AbstractExtractor.extract(pdf);

		assertThat(result.html())
				.contains("role-sensitive")
				.contains("guideline-based")
				.doesNotContain("rolesensitive")
				.doesNotContain("guidelinebased")
				.doesNotContain(soft);
	}

	/** Builds a PDF with one page per inner list of lines, for front-matter / page-window tests. */
	private static byte[] buildMultiPagePdf(List<List<Line>> pages) {
		try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
			try (PdfDocument pdf = new PdfDocument(new PdfWriter(out))) {
				PdfFont font = PdfFontFactory.createFont(StandardFonts.HELVETICA);
				for (List<Line> pageLines : pages) {
					PdfCanvas canvas = new PdfCanvas(pdf.addNewPage());
					for (Line line : pageLines) {
						canvas.beginText()
								.setFontAndSize(font, line.fontSize())
								.moveText(MARGIN_X, line.y())
								.showText(line.text())
								.endText();
					}
				}
			}
			return out.toByteArray();
		} catch (Exception e) {
			throw new RuntimeException("Failed to build test PDF", e);
		}
	}
}
