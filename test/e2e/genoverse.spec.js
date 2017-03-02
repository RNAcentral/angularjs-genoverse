describe("genoverse directive spec", function() {
    var Homepage = function() {
        browser.get("http://localhost:8000/index.html");

        this.genomicStartInput = element(by.css('.genomic-start-input'));
        this.genomicEndInput = element(by.css('.gnomic-end-input'));

        this.gvScrollRightButton = element(by.css('.gv-scroll-right'));
        this.gvWrapper = element(by.css('.gv-wrapper'));
    };

    var page;

    beforeEach(function() {
        page = new Homepage()
    });

    it("should update start and end locations in response to viewport movement button", function() {
        var initialStart = page.genomicStartInput.getAttribute('value');
        var initialEnd = page.genomicEndInput.getAttribute('value');

        page.gvScrollRightButton.click();

        var updatedStart = page.genomicStartInput.getAttribute('value');
        var updatedEnd = page.genomicEndInput.getAttribute('value');
        
        expect(updatedStart > initialStart).toBe(true);
        expect(updatedEnd > initialEnd).toBe(true)
    });

    it("should update start and end locations in response to viewport drag", function() {
        var initialStart = page.genomicStartInput.getAttribute('value');
        var initialEnd = page.genomicEndInput.getAttribute('value');

        // drag canvas, increase coordinates
        browser.action()
            .mouseMove(this.gvWrapper, {x: 200, y: 100})
            .mouseDown()
            .mouseMove({x: 100, y: 100})
            .mouseUp()
            .perform();

        var updatedStart = page.genomicStartInput.getAttribute('value');
        var updatedEnd = page.genomicEndInput.getAttribute('value');

        expect(updatedStart > initialStart).toBe(true);
        expect(updatedEnd > initialEnd).toBe(true)
    })
});