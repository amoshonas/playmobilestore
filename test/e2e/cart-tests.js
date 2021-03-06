var fs = require('fs');
var tu = require('./protractor-utils.js');

describe("cart:", function () {

        beforeEach(function () {
            browser.manage().deleteAllCookies();
            // ENSURE WE'RE TESTING AGAINST THE FULL SCREEN VERSION
            browser.driver.manage().window().setSize(1200, 1100);
            browser.get(tu.tenant + '/#!/ct/');
            // browser.switchTo().alert().then(
            //     function (alert) { alert.dismiss(); },
            //     function (err) { }
            // );
        });

        afterEach(function () {
            browser.switchTo().alert().then(
                function (alert) { alert.dismiss(); },
                function (err) { }
            );
        });

    describe("verify cart functionality", function () {



        it('should load one product into cart', function () {
            tu.loadProductIntoCart('1', '$10.67');
            tu.clickElement('id', tu.removeFromCart);
            browser.wait(function () {
                return element(by.xpath("//div[@id='cart']/div/div[2]")).isDisplayed();
            });
            expect(element(by.xpath("//div[@id='cart']/div/div[2]")).getText()).toEqual('YOUR CART IS EMPTY');
        });

        it('should load one product into cart in Euros', function () {
            tu.selectCurrency('EURO');
            tu.loadProductIntoCart('1', '€7.99');
            tu.clickElement('id', tu.removeFromCart);
            browser.wait(function () {
                return element(by.xpath("//div[@id='cart']/div/div[2]")).isDisplayed();
            });
            expect(element(by.xpath("//div[@id='cart']/div/div[2]")).getText()).toEqual('YOUR CART IS EMPTY');
        });

        it('should load one product into cart in USD and change to Euros', function () {
            tu.loadProductIntoCart('1', '$10.67');
            tu.clickElement('binding', 'CONTINUE_SHOPPING');
            tu.selectCurrency('EURO');
            tu.clickElement('id', tu.cartButtonId);
            tu.waitForCart();
            browser.sleep(1000); 
            tu.verifyCartTotal('€7.99');
        });

        it('should load one product into cart in USD and change to Euros while logged in', function () {
            tu.loadProductIntoCart('1', '$10.67');
            tu.clickElement('binding', 'CONTINUE_SHOPPING');
            tu.loginHelper('currtest@hybristest.com', 'password');
            browser.sleep(1000);
            tu.clickElement('id', tu.cartButtonId);
            tu.waitForCart();
            browser.sleep(2000);
            tu.verifyCartTotal('€7.99');
            tu.clickElement('id', tu.removeFromCart);
            browser.wait(function () {
                return element(by.xpath("//div[@id='cart']/div/div[2]")).isDisplayed();
            });
            expect(element(by.xpath("//div[@id='cart']/div/div[2]")).getText()).toEqual('YOUR CART IS EMPTY');
        });

        it('should load multiple products into cart', function () {
            tu.loadProductIntoCart('1', '$10.67');
            tu.clickElement('binding', 'CONTINUE_SHOPPING');
            // must hover before click
            var category =  element(by.repeater('category in categories').row(0).column('category.name'));
            browser.driver.actions().mouseMove(category).perform();
            browser.sleep(200);
            category.click();
            browser.sleep(250);
            tu.clickElement('xpath', tu.whiteThermos);
            browser.sleep(200);
            tu.clickElement('id', tu.buyButton);
            browser.sleep(5500);
            browser.wait(function () {
                return element(by.id(tu.cartButtonId)).isDisplayed();
            });
            browser.sleep(1000);
            tu.clickElement('id', tu.cartButtonId);
            tu.waitForCart();
            browser.sleep(500);
            tu.verifyCartTotal("$25.66");
        });


        it('should update quantity', function () {
            tu.loadProductIntoCart('1', '$10.67');
            tu.clickElement('binding', 'CONTINUE_SHOPPING');
            browser.sleep(250);
            tu.clickElement('id', tu.buyButton);
            browser.sleep(5000);
            browser.wait(function () {
                return element(by.id(tu.cartButtonId)).isDisplayed();
            });
            tu.clickElement('id', tu.cartButtonId);
            tu.waitForCart();
            browser.sleep(1000);
            tu.verifyCartAmount('2');
            browser.sleep(2000);
            tu.verifyCartTotal('$21.34');
            tu.sendKeysByXpath(tu.cartQuantity, '5');
            tu.clickElement('binding', 'EST_ORDER_TOTAL');
            browser.sleep(1000);
            tu.clickElement('binding', 'EST_ORDER_TOTAL');
            browser.sleep(1000);
            tu.verifyCartAmount("5");
            tu.verifyCartTotal("$53.35");
            tu.sendKeysByXpath(tu.cartQuantity, '10');
            tu.clickElement('binding', 'EST_ORDER_TOTAL');
            browser.sleep(1000);
            tu.clickElement('binding', 'EST_ORDER_TOTAL');
            browser.sleep(1000);
            tu.verifyCartAmount("10");
            tu.verifyCartTotal("$106.70");
        });

        it('should not add out of stock item', function () {
            tu.clickElement('id', tu.cartButtonId);
            tu.waitForCart();
            expect(element(by.binding('CART_EMPTY')).getText()).toEqual('YOUR CART IS EMPTY');
            tu.clickElement('binding', 'CONTINUE_SHOPPING');
            browser.wait(function () {
                return element(by.xpath(tu.blackCoffeeMug)).isDisplayed();
            });
            tu.clickElement('xpath', tu.blackCoffeeMug);
            browser.wait(function () {
                return element(by.id('out-of-stock-btn')).isDisplayed();
            });
            tu.clickElement('id', 'out-of-stock-btn');
            browser.sleep(500);
            tu.clickElement('id', tu.cartButtonId);
            tu.waitForCart();
            expect(element(by.binding('CART_EMPTY')).getText()).toEqual('YOUR CART IS EMPTY');
        });

        it('should retrieve previous cart', function () {
            tu.loginHelper('cart@hybristest.com', 'password');
            tu.clickElement('id', tu.cartButtonId);
            browser.sleep(250);
            tu.verifyCartTotal('$7.99');
        });

        xit('should automatically close when mousing off', function () {
            tu.loadProductIntoCart('1', '$10.67');
            browser.driver.actions().mouseMove(element(by.binding('item.product.name'))).perform();
            // wait over 3 seconds 
            browser.sleep(4500);
            browser.driver.actions().mouseMove(element(by.css('div.content-mask'))).perform();
            expect(element(by.binding('CONTINUE_SHOPPING')).isDisplayed()).toBe(false);
        });

    });
});

