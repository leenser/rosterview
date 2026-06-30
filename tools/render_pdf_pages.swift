import Foundation
import PDFKit
import AppKit

let args = CommandLine.arguments
guard args.count >= 3 else {
    fputs("Usage: render_pdf_pages.swift <pdf> <output-dir> [start-page] [end-page]\n", stderr)
    exit(2)
}

let pdfURL = URL(fileURLWithPath: args[1])
let outputDir = URL(fileURLWithPath: args[2], isDirectory: true)
let startPage = args.count >= 4 ? max(Int(args[3]) ?? 1, 1) : 1
let requestedEndPage = args.count >= 5 ? Int(args[4]) : nil

guard let document = PDFDocument(url: pdfURL) else {
    fputs("Could not open PDF: \(args[1])\n", stderr)
    exit(1)
}

try FileManager.default.createDirectory(at: outputDir, withIntermediateDirectories: true)

let pageCount = document.pageCount
let endPage = min(requestedEndPage ?? pageCount, pageCount)
let scale: CGFloat = 2.0

for pageNumber in startPage...endPage {
    guard let page = document.page(at: pageNumber - 1) else { continue }
    let bounds = page.bounds(for: .mediaBox)
    let size = NSSize(width: bounds.width * scale, height: bounds.height * scale)
    let image = NSImage(size: size)

    image.lockFocus()
    NSColor.white.set()
    NSRect(origin: .zero, size: size).fill()

    guard let context = NSGraphicsContext.current?.cgContext else {
        image.unlockFocus()
        continue
    }

    context.saveGState()
    context.scaleBy(x: scale, y: scale)
    page.draw(with: .mediaBox, to: context)
    context.restoreGState()
    image.unlockFocus()

    guard
        let tiff = image.tiffRepresentation,
        let bitmap = NSBitmapImageRep(data: tiff),
        let png = bitmap.representation(using: .png, properties: [:])
    else {
        continue
    }

    let outputURL = outputDir.appendingPathComponent(String(format: "page-%02d.png", pageNumber))
    try png.write(to: outputURL)
    print(outputURL.path)
}
