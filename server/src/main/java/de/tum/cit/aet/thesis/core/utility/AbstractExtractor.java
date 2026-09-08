package de.tum.cit.aet.thesis.core.utility;

import com.itextpdf.kernel.geom.Vector;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfReader;
import com.itextpdf.kernel.pdf.canvas.parser.EventType;
import com.itextpdf.kernel.pdf.canvas.parser.PdfCanvasProcessor;
import com.itextpdf.kernel.pdf.canvas.parser.data.IEventData;
import com.itextpdf.kernel.pdf.canvas.parser.data.TextRenderInfo;
import com.itextpdf.kernel.pdf.canvas.parser.listener.IEventListener;

import java.io.ByteArrayInputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Deterministically extracts the abstract section from a thesis or proposal PDF.
 *
 * <p>The extractor reads the PDF text together with position and font-size information,
 * locates an English abstract heading, bounds it at the next section, and rebuilds the
 * paragraphs faithfully (joining line-end hyphenation back into whole words). It only
 * reports {@link Confidence#CONFIDENT} when a clear heading and boundary were found and
 * the result is a sane length; otherwise the caller treats the result as a suggestion.
 */
public final class AbstractExtractor {

	/**
	 * Only the front matter is scanned — abstracts always appear there. Proposals place the
	 * abstract on page 1, but theses follow a template (title, declaration, acknowledgements,
	 * then abstract) that pushes it to around page 6, so the window must comfortably cover that.
	 */
	private static final int MAX_PAGES = 12;
	/** Baselines within this many points are considered the same text line. */
	private static final float LINE_Y_TOLERANCE = 3f;
	/**
	 * A new paragraph starts when the vertical gap exceeds this multiple of the typical
	 * (intra-paragraph) line gap. Kept modest so Word/LibreOffice abstracts that only add a
	 * little extra space after each paragraph are still split.
	 */
	private static final float PARAGRAPH_GAP_FACTOR = 1.25f;
	/** A line indented more than this many points past the left margin starts a new paragraph. */
	private static final float PARAGRAPH_INDENT_MIN = 6f;
	/**
	 * A line whose visible width is below this fraction of the body's widest line is treated as
	 * a short (likely final) line of a paragraph — used with sentence-end detection.
	 */
	private static final float SHORT_LINE_WIDTH_FACTOR = 0.85f;
	/** Minimum plausible abstract length (characters) for a confident result. */
	private static final int MIN_CONFIDENT_LENGTH = 50;
	/** Maximum plausible abstract length (characters) for a confident result. */
	private static final int MAX_CONFIDENT_LENGTH = 2000;
	/**
	 * Section headings (other than the abstract) that mark the end of the abstract. The German
	 * abstract headings are included because theses almost always place a "Zusammenfassung" right
	 * after the English abstract, set at body point size (so the font-size rule alone misses it).
	 */
	private static final Set<String> STOP_HEADINGS = Set.of(
			"introduction", "contents", "table of contents", "acknowledgements",
			"acknowledgments", "keywords", "index terms", "list of figures", "list of tables",
			"zusammenfassung", "kurzfassung");
	/** English abstract heading words. */
	private static final Set<String> ABSTRACT_HEADINGS = Set.of("abstract", "summary");
	private static final Pattern NUMBERED_HEADING = Pattern.compile("^\\d+(\\.\\d+)*\\.?\\s+\\S.*");
	/** Leading section number on a heading, e.g. "1 ", "1. ", "1.2 " — stripped before matching. */
	private static final Pattern SECTION_NUMBER_PREFIX = Pattern.compile("^\\d+(\\.\\d+)*\\.?\\s+");
	private static final Pattern CHAPTER_HEADING = Pattern.compile("^chapter\\s+\\d.*");
	private static final Pattern TRAILING_PUNCTUATION = Pattern.compile("[\\s:.]+$");
	private static final Pattern WHITESPACE = Pattern.compile("\\s+");
	/** End of a sentence, optionally followed by a closing quote. */
	private static final Pattern SENTENCE_END = Pattern.compile("[.!?]\u201d?\"?'?\\s*$");

	private AbstractExtractor() {
	}

	/** How confident the extractor is that it located a correct abstract. */
	public enum Confidence {
		/** A clear abstract heading and end boundary were found and the result looks sane. */
		CONFIDENT,
		/** An abstract heading was found but the boundary or length is questionable. */
		UNCERTAIN,
		/** No plausible abstract heading was found. */
		NONE
	}

	/**
	 * The outcome of an extraction attempt.
	 *
	 * @param confidence how confident the extractor is in the result
	 * @param html the extracted abstract as paragraph HTML, or empty when nothing was found
	 */
	public record Result(Confidence confidence, String html) {
	}

	private record Chunk(String text, float startX, float endX, float y, float fontSize, int page) {
	}

	private record Line(String text, int page, float y, float startX, float endX, float fontSize) {
	}

	/**
	 * Extracts the abstract from the given PDF.
	 *
	 * @param pdfBytes the raw PDF content
	 * @return the extraction result
	 */
	public static Result extract(byte[] pdfBytes) {
		List<Line> lines = readLines(pdfBytes);
		if (lines.isEmpty()) {
			return new Result(Confidence.NONE, "");
		}

		float medianFontSize = median(lines.stream().map(Line::fontSize).sorted().toList());

		int headingIndex = findHeadingIndex(lines);
		if (headingIndex < 0) {
			return new Result(Confidence.NONE, "");
		}

		Line heading = lines.get(headingIndex);
		int boundaryIndex = findBoundaryIndex(lines, headingIndex, medianFontSize);
		boolean boundaryFound = boundaryIndex >= 0;
		int end = boundaryFound ? boundaryIndex : lines.size();

		List<Line> body = dropFootnoteLines(lines.subList(headingIndex + 1, end));
		List<String> paragraphs = buildParagraphs(body);
		String html = toHtml(paragraphs);
		int plainLength = String.join(" ", paragraphs).length();

		boolean headingStrong = heading.fontSize() >= medianFontSize;
		boolean confident = headingStrong && boundaryFound
				&& plainLength >= MIN_CONFIDENT_LENGTH && plainLength <= MAX_CONFIDENT_LENGTH;

		return new Result(confident ? Confidence.CONFIDENT : Confidence.UNCERTAIN, html);
	}

	private static List<Line> readLines(byte[] pdfBytes) {
		List<Chunk> chunks = new ArrayList<>();

		try (PdfDocument pdf = new PdfDocument(new PdfReader(new ByteArrayInputStream(pdfBytes)))) {
			int pages = Math.min(pdf.getNumberOfPages(), MAX_PAGES);
			ChunkCollector collector = new ChunkCollector(chunks);
			PdfCanvasProcessor processor = new PdfCanvasProcessor(collector);

			for (int page = 1; page <= pages; page++) {
				collector.page = page;
				processor.processPageContent(pdf.getPage(page));
				processor.reset();
			}
		} catch (Exception e) {
			// Unreadable / encrypted / image-only PDF — nothing to extract.
			return List.of();
		}

		return groupIntoLines(chunks);
	}

	private static List<Line> groupIntoLines(List<Chunk> chunks) {
		List<Line> lines = new ArrayList<>();
		List<Chunk> sorted = new ArrayList<>(chunks);
		sorted.sort((a, b) -> {
			if (a.page() != b.page()) {
				return Integer.compare(a.page(), b.page());
			}
			if (Math.abs(a.y() - b.y()) > LINE_Y_TOLERANCE) {
				return Float.compare(b.y(), a.y());
			}
			return Float.compare(a.startX(), b.startX());
		});

		List<Chunk> currentParts = new ArrayList<>();
		for (Chunk chunk : sorted) {
			if (chunk.text().isBlank()) {
				continue;
			}
			boolean sameLine = !currentParts.isEmpty()
					&& currentParts.getLast().page() == chunk.page()
					&& Math.abs(currentParts.getLast().y() - chunk.y()) <= LINE_Y_TOLERANCE;
			if (!sameLine && !currentParts.isEmpty()) {
				lines.add(toLine(currentParts));
				currentParts = new ArrayList<>();
			}
			currentParts.add(chunk);
		}
		if (!currentParts.isEmpty()) {
			lines.add(toLine(currentParts));
		}

		return lines;
	}

	private static Line toLine(List<Chunk> parts) {
		parts.sort((a, b) -> Float.compare(a.startX(), b.startX()));
		StringBuilder text = new StringBuilder(parts.getFirst().text());
		float maxFontSize = parts.getFirst().fontSize();

		for (int i = 1; i < parts.size(); i++) {
			Chunk prev = parts.get(i - 1);
			Chunk part = parts.get(i);
			if (part.startX() - prev.endX() > 0.15f * part.fontSize()) {
				text.append(' ');
			}
			text.append(part.text());
			maxFontSize = Math.max(maxFontSize, part.fontSize());
		}

		String collapsed = WHITESPACE.matcher(text.toString()).replaceAll(" ").trim();
		return new Line(normalizeHyphens(collapsed), parts.getFirst().page(), parts.getFirst().y(),
				parts.getFirst().startX(), parts.getLast().endX(), maxFontSize);
	}

	/**
	 * Normalizes the various hyphen encodings real PDFs use into a plain ASCII hyphen so the
	 * line-join de-hyphenation works uniformly. Some thesis fonts map their hyphen glyph to the
	 * Unicode replacement character (U+FFFD); Unicode hyphen / non-breaking hyphen are also
	 * folded in. A soft hyphen (U+00AD) is only a real break when it ends a line — anywhere else
	 * it is an invisible discretionary hyphen and is dropped.
	 *
	 * <p>Package-private so the normalization can be unit-tested directly: the U+FFFD case cannot
	 * be reproduced through a synthetic PDF because standard fonts drop the glyph at write time.
	 *
	 * @param text the collapsed line text
	 * @return the line text with hyphen encodings normalized
	 */
	static String normalizeHyphens(String text) {
		String result = text
				.replace((char) 0xFFFD, '-')
				.replace((char) 0x2010, '-')
				.replace((char) 0x2011, '-');
		String softHyphen = String.valueOf((char) 0x00AD);
		if (result.endsWith(softHyphen)) {
			result = result.substring(0, result.length() - 1) + "-";
		}
		return result.replace(softHyphen, "");
	}

	private static int findHeadingIndex(List<Line> lines) {
		for (int i = 0; i < lines.size(); i++) {
			if (isAbstractHeading(lines.get(i).text())) {
				return i;
			}
		}
		return -1;
	}

	private static boolean isAbstractHeading(String text) {
		String normalized = normalize(text);
		if (ABSTRACT_HEADINGS.contains(normalized)) {
			return true;
		}
		String withoutSection = SECTION_NUMBER_PREFIX.matcher(normalized).replaceFirst("");
		return !withoutSection.equals(normalized) && ABSTRACT_HEADINGS.contains(withoutSection);
	}

	private static int findBoundaryIndex(List<Line> lines, int headingIndex, float medianFontSize) {
		for (int i = headingIndex + 1; i < lines.size(); i++) {
			if (isBoundary(lines.get(i), medianFontSize)) {
				return i;
			}
		}
		return -1;
	}

	private static boolean isBoundary(Line line, float medianFontSize) {
		String normalized = normalize(line.text());
		int words = WHITESPACE.split(line.text().trim()).length;

		if (STOP_HEADINGS.contains(normalized)) {
			return true;
		}
		if ((NUMBERED_HEADING.matcher(normalized).matches() || CHAPTER_HEADING.matcher(normalized).matches())
				&& words <= 5) {
			return true;
		}
		return line.fontSize() > medianFontSize && words <= 6;
	}

	/**
	 * Removes footnote definition lines from the abstract body. Footnotes sit at the page bottom
	 * and begin with a superscript digit marker; their text (frequently URLs) is not part of the
	 * abstract. Inline footnote reference markers within sentences are left untouched to avoid
	 * corrupting legitimate superscripts such as mathematical exponents.
	 *
	 * @param body the candidate abstract lines
	 * @return the lines with footnote definitions removed
	 */
	private static List<Line> dropFootnoteLines(List<Line> body) {
		List<Line> result = new ArrayList<>();
		for (Line line : body) {
			String trimmed = line.text().trim();
			if (!trimmed.isEmpty() && isSuperscriptDigit(trimmed.charAt(0))) {
				continue;
			}
			result.add(line);
		}
		return result;
	}

	private static boolean isSuperscriptDigit(char c) {
		// ¹ ² ³ live in Latin-1; ⁰ and ⁴–⁹ live in the superscripts block.
		return c == 0x00B9 || c == 0x00B2 || c == 0x00B3
				|| c == 0x2070 || (c >= 0x2074 && c <= 0x2079);
	}

	private static List<String> buildParagraphs(List<Line> body) {
		List<String> paragraphs = new ArrayList<>();
		if (body.isEmpty()) {
			return paragraphs;
		}

		float typicalGap = typicalGap(body);
		float leftMargin = leftMargin(body);
		float maxLineWidth = maxLineWidth(body);
		List<Line> current = new ArrayList<>();
		current.add(body.getFirst());

		for (int i = 1; i < body.size(); i++) {
			Line prev = body.get(i - 1);
			Line line = body.get(i);
			// A paragraph break shows up as: extra vertical space; a first-line indent
			// (LaTeX-style with no inter-paragraph space); or a short last line that ended a
			// sentence while the next line starts a new one (flush-left, same leading).
			boolean newParagraph = prev.page() != line.page()
					|| (prev.y() - line.y()) > PARAGRAPH_GAP_FACTOR * typicalGap
					|| line.startX() - leftMargin > PARAGRAPH_INDENT_MIN
					|| isParagraphBreakByShortLine(prev, line, leftMargin, maxLineWidth);
			if (newParagraph) {
				paragraphs.add(joinLines(current));
				current = new ArrayList<>();
			}
			current.add(line);
		}
		paragraphs.add(joinLines(current));

		paragraphs.removeIf(String::isBlank);
		return paragraphs;
	}

	/** The body's left margin: the smallest line start, i.e. the non-indented continuation lines. */
	private static float leftMargin(List<Line> body) {
		float min = Float.MAX_VALUE;
		for (Line line : body) {
			min = Math.min(min, line.startX());
		}
		return min;
	}

	private static float maxLineWidth(List<Line> body) {
		float max = 0f;
		for (Line line : body) {
			max = Math.max(max, line.endX() - line.startX());
		}
		return max;
	}

	/**
	 * Typical intra-paragraph line gap: a low percentile of observed gaps so large paragraph
	 * gaps (common in abstracts with many short paragraphs) do not inflate the baseline the way
	 * a plain median would.
	 */
	private static float typicalGap(List<Line> body) {
		List<Float> gaps = new ArrayList<>();
		for (int i = 1; i < body.size(); i++) {
			float gap = body.get(i - 1).y() - body.get(i).y();
			if (gap > 0 && body.get(i - 1).page() == body.get(i).page()) {
				gaps.add(gap);
			}
		}
		if (gaps.isEmpty()) {
			return 0f;
		}
		gaps.sort(Float::compare);
		int index = Math.min(gaps.size() - 1, Math.max(0, (int) (gaps.size() * 0.25f)));
		return gaps.get(index);
	}

	/**
	 * Detects a paragraph break when layout uses neither extra vertical space nor a first-line
	 * indent: the previous line ends a sentence and is visually short (not wrapping to the
	 * column edge), while the next line starts with a capital letter.
	 */
	private static boolean isParagraphBreakByShortLine(
			Line prev, Line next, float leftMargin, float maxLineWidth) {
		if (maxLineWidth <= 0f) {
			return false;
		}
		String prevText = prev.text().trim();
		String nextText = next.text().trim();
		if (prevText.isEmpty() || nextText.isEmpty()) {
			return false;
		}
		if (!SENTENCE_END.matcher(prevText).find()) {
			return false;
		}
		if (!Character.isUpperCase(nextText.codePointAt(0))) {
			return false;
		}
		float prevWidth = prev.endX() - leftMargin;
		return prevWidth < SHORT_LINE_WIDTH_FACTOR * maxLineWidth;
	}

	private static String joinLines(List<Line> lines) {
		StringBuilder result = new StringBuilder();
		for (Line line : lines) {
			String text = line.text().trim();
			if (text.isEmpty()) {
				continue;
			}
			if (result.isEmpty()) {
				result.append(text);
				continue;
			}
			int last = result.length() - 1;
			boolean hyphenBreak = result.charAt(last) == '-'
					&& last > 0 && Character.isLetter(result.charAt(last - 1));
			if (hyphenBreak && Character.isLowerCase(text.charAt(0))) {
				// Soft line-break hyphen: rejoin into a single word.
				result.deleteCharAt(last).append(text);
			} else if (hyphenBreak) {
				// Hyphen before an uppercase letter or digit: likely a real compound, keep it.
				result.append(text);
			} else {
				result.append(' ').append(text);
			}
		}
		return WHITESPACE.matcher(result.toString()).replaceAll(" ").trim();
	}

	private static String toHtml(List<String> paragraphs) {
		StringBuilder html = new StringBuilder();
		for (String paragraph : paragraphs) {
			html.append("<p>").append(escapeHtml(paragraph)).append("</p>");
		}
		return html.toString();
	}

	private static String escapeHtml(String text) {
		return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
	}

	private static String normalize(String text) {
		String trimmed = TRAILING_PUNCTUATION.matcher(text.trim()).replaceAll("");
		return trimmed.toLowerCase(Locale.ROOT);
	}

	private static float median(List<Float> sortedValues) {
		if (sortedValues.isEmpty()) {
			return 0f;
		}
		int size = sortedValues.size();
		if (size % 2 == 1) {
			return sortedValues.get(size / 2);
		}
		return (sortedValues.get(size / 2 - 1) + sortedValues.get(size / 2)) / 2f;
	}

	private static final class ChunkCollector implements IEventListener {
		private final List<Chunk> chunks;
		private int page;

		private ChunkCollector(List<Chunk> chunks) {
			this.chunks = chunks;
		}

		@Override
		public void eventOccurred(IEventData data, EventType type) {
			if (type != EventType.RENDER_TEXT || !(data instanceof TextRenderInfo info)) {
				return;
			}
			String text = info.getText();
			if (text == null || text.isEmpty()) {
				return;
			}
			Vector start = info.getBaseline().getStartPoint();
			Vector end = info.getBaseline().getEndPoint();
			chunks.add(new Chunk(
					text,
					start.get(Vector.I1),
					end.get(Vector.I1),
					start.get(Vector.I2),
					info.getFontSize(),
					page));
		}

		@Override
		public Set<EventType> getSupportedEvents() {
			return Set.of(EventType.RENDER_TEXT);
		}
	}
}
