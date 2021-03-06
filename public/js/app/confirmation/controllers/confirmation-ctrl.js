/**
 * [y] hybris Platform
 *
 * Copyright (c) 2000-2015 hybris AG
 * All rights reserved.
 *
 * This software is the confidential and proprietary information of hybris
 * ("Confidential Information"). You shall not disclose such Confidential
 * Information and shall use it only in accordance with the terms of the
 * license agreement you entered into with hybris.
 */

'use strict';


angular.module('ds.confirmation')
    /** Controls the order confirmation page. */
    .controller('ConfirmationCtrl', ['$scope',  '$stateParams', 'OrderDetailSvc', 'ProductSvc', 'GlobalData', 'isAuthenticated', '$rootScope', function
        ($scope, $stateParams, OrderDetailSvc, ProductSvc,  GlobalData, isAuthenticated, $rootScope) {

        $scope.accountSuccess = false;
        $scope.orderInfo = {};
        $scope.orderInfo.orderId = $stateParams.orderId;
        $scope.isAuthenticated = isAuthenticated;
        window.scrollTo(0, 0);

        /* OrderDetails are retrieved on controller instantiation, rather than being injected
        * through UI router.  This allows us to display the page immediately while filling in the details as they become
        * available. It's a visual/psychological clue that the order processing success is being made.
        *
        * @param orderId used to retrieve order details for the confirmation
        */
        OrderDetailSvc.getFormattedConfirmationDetails($scope.orderInfo.orderId).then(function(details){
            $scope.confirmationDetails = details;

            var productSkus = details.entries.map(function (entry) {
                return entry.product.sku;
            });
            var amount = details.entries.map(function(entry){
               return entry.amount;
            });
            $scope.confirmationDetails.itemCount = amount.reduce(function (total, count){
                return total+count;
            });

            var productParms = {
                q: 'sku:(' + productSkus + ')'
            };

            $scope.currencySymbol = GlobalData.getCurrencySymbol(details.currency);

            ProductSvc.query(productParms).then(function(productResult){
                $scope.confirmationDetails.products = productResult;

                /*
                    the product details service does not provide the actual price paid in the order,
                    nor does it provide the quantity ordered.  So we have to map that data
                    to each product
                 */
                angular.forEach(details.entries, function (entry) {
                    angular.forEach($scope.confirmationDetails.products, function (product, key) {
                        if (product.sku === entry.product.sku) {
                            $scope.confirmationDetails.products[key].price = entry.unitPrice;
                            $scope.confirmationDetails.products[key].amount = entry.amount;
                        }
                    });
                });
            });

            var unbindConfirmAccount = $rootScope.$on('confirmation:account', function(){
                // show success panel
                $scope.accountSuccess = true;
            });
            $scope.$on('$destroy', unbindConfirmAccount);


        });

    }]);