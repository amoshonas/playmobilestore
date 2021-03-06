var fs = require('fs');
var tu = require('./protractor-utils.js');


describe('product page', function () {

    describe('verify product pages', function () {

        beforeEach(function () {
            browser.manage().deleteAllCookies();
            browser.driver.manage().window().setSize(1000, 1000);
            browser.get(tu.tenant + '/#!/ct/');
            browser.switchTo().alert().then(
                function (alert) { alert.accept(); },
                function (err) { }
            );
        });

        //crashes browser. to be address in STOR-1567
        xit('should scroll to load more products', function () {
            expect(browser.getTitle()).toEqual('Süshi Démo Støre');
            tu.getTextByRepeaterRow(0);
            tu.scrollToBottomOfProducts().then(function () {
                tu.getTextByRepeaterRow(30); //verify last product has loaded
                tu.clickElement('id', tu.backToTopButton);
                tu.clickElement('xpath', tu.blackCoffeeMug);
            });
        });

        it('should show the user how many products loaded', function () {
            tu.getTextByRepeaterRow(0);
            expect(element(by.css('div.page-indicator.ng-binding')).getText()).toContain('1-');
            tu.scrollToBottomOfProducts()
            tu.getTextByRepeaterRow(36); //verify last product has loaded
            browser.sleep(500);
            expect(element(by.css('div.col-xs-12 > div.viewingContainer > div.page-indicator.ng-binding')).getText()).toContain('-38 of 38'); //should be # of 31, but won't work in phantomjs

        });

        it('should get product detail page', function () {
            browser.driver.actions().mouseMove(element(by.repeater('category in categories').row(3).column('category.name'))).perform();
            browser.sleep(200);
            element(by.repeater('category in categories').row(3).column('category.name')).click();
            tu.clickElement('xpath', tu.whiteCoffeeMug);
            browser.wait(function () {
                return element(by.binding(tu.productDescriptionBind)).isPresent();
            });
            expect(element(by.binding(tu.productDescriptionBind)).getText()).toEqual('DESCRIPTION:\nDrink your morning, afternoon, and evening coffee from the hybris mug. Get caffinated in style.');
            expect(element(by.binding('product.defaultPrice.value')).getText()).toEqual('$10.67');
            expect(element(by.repeater('item in items.path').row(0)).getText()).toEqual('Mugs');

            tu.selectLanguage('GERMAN');
            tu.selectCurrency('EURO');

            browser.sleep(3000);
            expect(element(by.binding(tu.productDescriptionBind)).getText()).toEqual('BESCHREIBUNG:\nTrinken Sie Ihren Vormittag, Nachmittag, Abend und Kaffee aus der hybris Becher. Holen caffinated im Stil.');
            expect(element(by.binding('product.defaultPrice.value')).getText()).toEqual('€7.99');
            expect(element(by.repeater('item in items.path').row(0)).getText()).toEqual('Tassen');
            // verify refreshing grabs correct config (STOR-1183)
            browser.get(tu.tenant + '/#!/products/5502177da4ae283d1df57d04/');
            expect(element(by.binding(tu.productDescriptionBind)).getText()).toEqual('BESCHREIBUNG:\nTrinken Sie Ihren Vormittag, Nachmittag, Abend und Kaffee aus der hybris Becher. Holen caffinated im Stil.');
            expect(element(by.binding('product.defaultPrice.value')).getText()).toEqual('€7.99');
        });

        it('should get order of products correctly in english and USD', function () {
            tu.getTextByRepeaterRow(0);
            //price is not currently supported
            // tu.sortAndVerifyPagination('price', 'FRENCH PRESS');
            // browser.sleep(750);
            // tu.sortAndVerifyPagination('-price', 'ESPRESSO MACHINE');
            // browser.sleep(750);
            tu.sortAndVerifyPagination('name', 'BEER MUG', '$6.99');
            browser.sleep(750);
            tu.sortAndVerifyPagination('name:desc', "WOMEN'S T-SHIRT - GRAY", '$14.99');
            browser.sleep(750);
            tu.sortAndVerifyPagination('created:desc', 'BEER MUG W/HELLES', '$7.99');
        });

        it('should get order of products correctly in german and Euros', function () {
            //default load
            tu.getTextByRepeaterRow(0);
            //price is not currently supported
            tu.selectLanguage('GERMAN');
            tu.selectCurrency('EURO');
            browser.sleep(3000);
            // tu.sortAndVerifyPagination('price', 'FRANZÖSISCH PRESSE');
            // browser.sleep(750);
            // tu.sortAndVerifyPagination('-price', 'ESPRESSOMASCHINE');
            // browser.sleep(750);
            tu.sortAndVerifyPagination('name', 'BIERKRUG', '€5.59');
            browser.sleep(750);
            tu.sortAndVerifyPagination('name:desc', 'WASSER-FLASCHE', '€19.99');
            browser.sleep(750);
            tu.sortAndVerifyPagination('created:desc', 'BIERKRUG W / HELLES', '€6.39');
        });


        it('should navigate by categories', function () {
            //default load
            tu.getTextByRepeaterRow(0);
            //price is not currently supported
            browser.sleep(3000);
            tu.clickElement('linkText', 'COMPUTER ACCESSORIES');
            tu.assertProductByRepeaterRow(0, 'EARBUDS');
            tu.sortAndVerifyPagination('name', 'EARBUDS', '$15.00');
            browser.sleep(750);
            tu.sortAndVerifyPagination('name:desc', 'USB', '$5.99');
            browser.sleep(750);
            tu.sortAndVerifyPagination('created:desc', 'MOUSEPAD', '$1.99');
            browser.get(tu.tenant + '/#!/ct/mugs~269735936');
            browser.driver.manage().window().maximize();
            browser.sleep(2000);
            tu.assertProductByRepeaterRow(0, 'COFFEE MUG - BLACK');
            tu.sortAndVerifyPagination('name', 'BEER MUG', '$6.99');
            browser.sleep(750);
            tu.sortAndVerifyPagination('name:desc', 'COFFEE MUGS WITH COFFEE BEANS - PACKAGE', '$16.49');
            browser.sleep(750);
            tu.sortAndVerifyPagination('created:desc', 'BEER MUG W/HELLES', '$7.99');
            browser.get(tu.tenant + '/#!/ct/cosmetics~273954304');
        });

        it('should search', function () {
            tu.sendKeysById('search', 'beer');
            expect(element(by.repeater('result in search.results').row(0)).getText()).toEqual('Beer Mug w/Helles');
            expect(element(by.repeater('result in search.results').row(1)).getText()).toEqual('Beer Mug');
            expect(element(by.repeater('result in search.results').row(2)).getText()).toEqual('Water Bottle');
            element(by.repeater('result in search.results').row(1)).click();
            expect(element(by.binding(tu.productDescriptionBind)).getText()).toEqual("DESCRIPTION:\nTraditional bavarian beer mug with hybris logo in blue. Drink your beer in the same style as hybris employees have done since the company's first days.");
        });

        it('not return search results', function () {
            tu.sendKeysById('search', 'test1');
            expect(element(by.repeater('result in search.results').row(0)).isPresent()).toBe(false);
        });

        it('should take user to search results page', function () {
            tu.sendKeysById('search', 'beer');
            expect(element(by.binding('search.numberOfHits')).getText()).toEqual('See All 3 Results');
            tu.clickElement('binding', 'search.numberOfHits');
            tu.assertProductByRepeaterRow('0', 'BEER MUG');
            tu.assertProductByRepeaterRow('1', 'WATER BOTTLE');
            tu.assertProductByRepeaterRow('2', 'BEER MUG W/HELLES');
        });

    });
}); 

