/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search'], function (record, search) {

    function beforeLoad(context) {

    }

    function beforeSubmit(context) {
        try {
            var Tax = 2
            var shipping = 1
            var PO_obj = context.newRecord
            var Taxes = PO_obj.getValue({ fieldId: 'custbody_taxes_for_po' }) || null
            var Shipping_Handling = PO_obj.getValue({ fieldId: 'custbody_shipping_handling_for_po' }) || null
            log.debug({ title: 'Taxes', details: Taxes })
            log.debug({ title: 'Shipping_Handling', details: Shipping_Handling })
            if (Taxes != null || Shipping_Handling != null) {
                var Linecount = PO_obj.getLineCount({ sublistId: 'item' })
                var Item_First = PO_obj.getSublistValue({ sublistId: 'item', fieldId: 'item', line: 0 })
                log.debug({ title: 'Item_First', details: Item_First })
                var Item_Type = PO_obj.getSublistValue({ sublistId: 'item', fieldId: 'itemtype', line: 0 })
                var lookup_item = search.lookupFields({
                    type: search.Type.ITEM,
                    id: Item_First,
                    columns: ['expenseaccount']
                })
                //log.debug({ title: 'lookup_item', details: lookup_item })
                var Account = lookup_item.expenseaccount[0].value
                log.debug({ title: 'Account-non', details: Account })
            }
            if (Taxes != null) {
                var taxandshippingitemsSearchObj = search.create({
                    type: "customrecord_taxandshippingitems",
                    filters: [["custrecord_tax_shipping_account", "anyof", Account], "AND", ["custrecord_item_type_custrec", "anyof", Tax]],
                    columns: [search.createColumn({ name: "custrecord_tax_shipping_account", label: "Account" }),
                    search.createColumn({ name: "custrecord_tax_shipping_item", label: "Item" }),
                    search.createColumn({ name: "custrecord_item_type_custrec", label: "Item Type" })]
                });
                var Runobj_tax_item = taxandshippingitemsSearchObj.run().getRange(0, 1000)
                log.debug({ title: 'Runobj_tax_item', details: Runobj_tax_item.length })
                if (Runobj_tax_item.length > 0) {
                    var Tax_item = Runobj_tax_item[0].getValue({ name: 'custrecord_tax_shipping_item' })
                    var counter_tax = 0
                    for (var i = 0; i < Linecount; i++) {
                        var Item_PO = PO_obj.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i })
                        if (Item_PO != Tax_item) {
                            counter_tax++
                        }
                    }
                    log.debug({ title: counter_tax, details: Linecount })
                    if (counter_tax == Linecount) {
                        PO_obj.setSublistValue({ sublistId: 'item', fieldId: 'item', line: Linecount, value: Tax_item })
                        PO_obj.setSublistValue({ sublistId: 'item', fieldId: 'amount', line: Linecount, value: Taxes })
                    }
                }
            }
            if (Shipping_Handling != null) {
                var taxandshippingitemsSearchObj = search.create({
                    type: "customrecord_taxandshippingitems",
                    filters: [["custrecord_tax_shipping_account", "anyof", Account], "AND", ["custrecord_item_type_custrec", "anyof", shipping]],
                    columns: [search.createColumn({ name: "custrecord_tax_shipping_account", label: "Account" }),
                    search.createColumn({ name: "custrecord_tax_shipping_item", label: "Item" }),
                    search.createColumn({ name: "custrecord_item_type_custrec", label: "Item Type" })]
                });
                var Runobj_shipping_item = taxandshippingitemsSearchObj.run().getRange(0, 1000)
                log.debug({ title: Runobj_shipping_item.length, details: Runobj_shipping_item })
                if (Runobj_shipping_item.length > 0) {
                    var shipping_item = Runobj_shipping_item[0].getValue({ name: 'custrecord_tax_shipping_item' })
                    var counter_shipping = 0
                    for (var i = 0; i < Linecount; i++) {
                        var Item_PO = PO_obj.getSublistValue({ sublistId: 'item', fieldId: 'item', line: i })
                        if (Item_PO != shipping_item) {
                            counter_shipping++
                        }
                    }
                    log.debug({ title: counter_shipping, details: Linecount })
                    if (counter_shipping == Linecount) {
                        PO_obj.setSublistValue({ sublistId: 'item', fieldId: 'item', line: Linecount, value: shipping_item })
                        PO_obj.setSublistValue({ sublistId: 'item', fieldId: 'amount', line: Linecount, value: Shipping_Handling })
                    }
                }
            }

        } catch (error) {
            log.debug({ title: 'error', details: error })
        }
    }

    function afterSubmit(context) {

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    }
});
