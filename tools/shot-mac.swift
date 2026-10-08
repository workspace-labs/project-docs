// Builder's tool, macOS only: opens a preview page in WebKit (Safari's engine), waits for it to finish,
// prints whether it is ready or refused (with the text of every problem), and writes a full-page PNG.
// Usage (through shot-mac.sh): shot-mac <preview.html> <out.png> <width>
// Exit 0 = ready, 2 = the page refused, 1 = the tool failed.
import Cocoa
import WebKit

final class Shooter: NSObject, WKNavigationDelegate {
    let web: WKWebView
    let window: NSWindow
    let out: URL
    let width: Double
    var tries = 0

    init(page: URL, out: URL, width: Double) {
        self.out = out
        self.width = width
        web = WKWebView(frame: NSRect(x: 0, y: 0, width: width, height: 900))
        window = NSWindow(contentRect: NSRect(x: -4000, y: 0, width: width, height: 900),
                          styleMask: [.borderless], backing: .buffered, defer: false)
        super.init()
        window.contentView = web
        web.navigationDelegate = self
        web.loadFileURL(page, allowingReadAccessTo: page.deletingLastPathComponent())
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) { poll() }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) { fail("load failed: \(error)") }

    func poll() {
        web.evaluateJavaScript("document.body.getAttribute('data-preview')") { value, _ in
            let state = value as? String ?? ""
            if state == "ready" || state == "refused" { self.report(state) }
            else if self.tries > 100 { self.fail("the page never finished (no data-preview after 20 s)") }
            else { self.tries += 1; DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) { self.poll() } }
        }
    }

    func report(_ state: String) {
        let js = "JSON.stringify({h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth, problems: [...document.querySelectorAll('.fix li')].map(li => li.textContent)})"
        web.evaluateJavaScript(js) { value, _ in
            guard let text = value as? String, let data = text.data(using: .utf8),
                  let obj = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                  let h = obj["h"] as? Double, let w = obj["w"] as? Double else { return self.fail("could not measure the page") }
            print(state.uppercased())
            for p in obj["problems"] as? [String] ?? [] { print(" - \(p)") }
            if w > self.width { print("WIDER THAN THE WINDOW: \(Int(w)) px in \(Int(self.width)) px") }
            let size = NSSize(width: self.width, height: h)
            self.window.setContentSize(size)
            self.web.setFrameSize(size)
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) { self.snap(state == "ready" ? 0 : 2) }
        }
    }

    func snap(_ code: Int32) {
        let config = WKSnapshotConfiguration()
        config.snapshotWidth = NSNumber(value: width)
        web.takeSnapshot(with: config) { image, error in
            guard let image = image, let tiff = image.tiffRepresentation, let rep = NSBitmapImageRep(data: tiff),
                  let png = rep.representation(using: .png, properties: [:]) else { return self.fail("snapshot: \(String(describing: error))") }
            try? png.write(to: self.out)
            exit(code)
        }
    }

    func fail(_ why: String) {
        FileHandle.standardError.write("shot-mac: \(why)\n".data(using: .utf8)!)
        exit(1)
    }
}

let args = CommandLine.arguments
guard args.count == 4, let width = Double(args[3]) else {
    FileHandle.standardError.write("usage: shot-mac <preview.html> <out.png> <width>\n".data(using: .utf8)!)
    exit(1)
}
let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
let shooter = Shooter(page: URL(fileURLWithPath: args[1]), out: URL(fileURLWithPath: args[2]), width: width)
app.run()
