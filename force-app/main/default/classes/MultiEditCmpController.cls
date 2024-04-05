public with sharing class MultiEditCmpController {
    @AuraEnabled(cacheable=true)
    public static List<FieldConditionsWrapper> getFieldConditions(String objectApiName) {
        List<FieldConditions__c> fieldConditions = [
            SELECT Id, FieldName__c, HiddenCondition__c, ReadonlyCondition__c, NewCondition__c, DeleteCondition__c, MandatoryCondition__c 
            FROM FieldConditions__c WHERE object__c = :objectApiName
        ];

        List<FieldConditionsWrapper> wrappedConditions = new List<FieldConditionsWrapper>();
        for (FieldConditions__c condition : fieldConditions) {
            wrappedConditions.add(new FieldConditionsWrapper(
                condition.Id,
                condition.FieldName__c,
                condition.HiddenCondition__c,
                condition.ReadonlyCondition__c,
                condition.MandatoryCondition__c,
                condition.NewCondition__c,
                condition.DeleteCondition__c
            ));
        }

        return wrappedConditions;
    }

    public class FieldConditionsWrapper {
        @AuraEnabled public String recordId;
        @AuraEnabled public String fieldName;
        @AuraEnabled public String hiddenCondition;
        @AuraEnabled public String readonlyCondition;
        @AuraEnabled public String mandatoryCondition;
        @AuraEnabled public String newRecordCondition;
        @AuraEnabled public String deleteRecordCondition;

        public FieldConditionsWrapper(String recordId, String fieldName, String hiddenCondition, String readonlyCondition, string mandatoryCondition, string newRecordCondition, string deleteRecordCondition) {
            this.recordId = recordId;
            this.fieldName = fieldName;
            this.hiddenCondition = hiddenCondition;
            this.readonlyCondition = readonlyCondition;
            this.mandatoryCondition = mandatoryCondition;
            this.newRecordCondition = newRecordCondition;
            this.deleteRecordCondition = deleteRecordCondition;
        }
    }
}