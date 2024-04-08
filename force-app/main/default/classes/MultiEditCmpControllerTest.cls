@isTest
private class MultiEditCmpControllerTest {

    @isTest
    static void testGetFieldConditions() {
        // Create test data
        String objectApiName = 'Test_Object__c';
        FieldConditions__c testCondition = new FieldConditions__c(
            object__c = objectApiName,
            FieldName__c = 'Test_Field__c',
            HiddenCondition__c = '[Test_Field__c] === \'Text\'',
            ReadonlyCondition__c = '[Test_Field__c] === \'Text\'',
            MandatoryCondition__c = '[Test_Field__c] === \'Text\'',
            NewCondition__c = '[Test_Field__c] === \'Text\'',
            DeleteCondition__c = '[Test_Field__c] === \'Text\''
        );
        insert testCondition;

        // Call the method to be tested
        Test.startTest();
        List<MultiEditCmpController.FieldConditionsWrapper> result = MultiEditCmpController.getFieldConditions(objectApiName);
        Test.stopTest();

        // Verify the result
        System.assertEquals(1, result.size());
        MultiEditCmpController.FieldConditionsWrapper wrapper = result[0];
        System.assertEquals(testCondition.Id, wrapper.recordId);
        System.assertEquals(testCondition.FieldName__c, wrapper.fieldName);
        System.assertEquals(testCondition.HiddenCondition__c, wrapper.hiddenCondition);
        System.assertEquals(testCondition.ReadonlyCondition__c, wrapper.readonlyCondition);
        System.assertEquals(testCondition.MandatoryCondition__c, wrapper.mandatoryCondition);
        System.assertEquals(testCondition.NewCondition__c, wrapper.newRecordCondition);
        System.assertEquals(testCondition.DeleteCondition__c, wrapper.deleteRecordCondition);
    }
}
