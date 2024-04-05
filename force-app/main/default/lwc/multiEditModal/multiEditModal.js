import { api, wire } from 'lwc';
import LightningModal from 'lightning/modal';
import Toast from 'lightning/toast';
import { refreshApex, deleteRecord } from 'lightning/uiRecordApi';
import getFieldConditions from '@salesforce/apex/MultiEditCmpController.getFieldConditions';

export default class multiEditModal extends LightningModal {
    @api content;
    @api records;
    @api computeGridClass;
    @api computeGridClass2;
    @api extractedFields;
    @api relatedListId;
    @api relatedObjectApiName;
    @api parentField;
    @api parentRecordId;
    isFieldVisible = true;

    fieldConditions;
    hiddenConditions = {};
    readonlyConditions = {};
    mandatoryConditions = {};

    @wire(getFieldConditions, { objectApiName: '$relatedObjectApiName' })
    wiredFieldConditions({ error, data }) {
        if (data) {
            this.fieldConditions = data;
            this.applyFieldConditions();
        } else if (error) {
            console.error(error);   
        }
    }

    connectedCallback() {
        // When the component is initialized, process existing records to add a unique identifier
        this.records = this.records.map(record => ({
            ...record,
            tempid: record.id || `temp_${Date.now()}` // Use existing ID or assign a new temp ID
        }));
        console.log('tst257'+this.extractedFields);
    }

    handleOkay() {
        this.close('okay');
    }

    addNewRecord() {
        // Create a new record object with a unique ID
       const newRecord = {
        tempid: `temp_${Date.now()}` // Initialize fields if necessary
    };
        // Add the new record to the records array
        this.records = [...this.records, newRecord];
        setTimeout(() => {
            this.scrollToLastRecord();
        }, 500);
       // this.applyFieldConditions();
    }

    scrollToLastRecord() {
        const recordContainers = this.template.querySelectorAll('.record-container');
        const lastRecordContainer = recordContainers[recordContainers.length - 1];
        lastRecordContainer.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    }


    onSave(event) {

        const savedRecord = event.detail;

        // Check if the record already exists in the records array
        const existingRecordIndex = this.records.findIndex(record => record.id === savedRecord.id);

        if (existingRecordIndex !== -1) {
            // Update the existing record in the records array
            this.records = [
                ...this.records.slice(0, existingRecordIndex),
                savedRecord,
                ...this.records.slice(existingRecordIndex + 1)
            ];
        } else {
            // Add the newly created record to the records array
            this.records = [...this.records, savedRecord];
        }

        this.records = this.records.filter(record => record.id);

        const recordId = event.detail.id;
        console.log('tst257'+JSON.stringify(event.detail));
        Toast.show({
            label: '{0} has been created/updated',
            labelLinks : [{
                url: `/lightning/r/${this.relatedObjectApiName}/${recordId}/view`,
                label: 'Record'
            }],
            mode: 'sticky',
            variant: 'success',
        }, this);


    }

    handleDeleteRecord(event) {
        const recordId = event.target.dataset.recordId;
        const tempId = event.target.dataset.tempid;

        if (recordId) {
            deleteRecord(recordId)
                .then(() => {
                    Toast.show({
                        label: 'Record has been deleted',
                        variant: 'success',
                    }, this);
                    this.records = this.records.filter(record => record.id !== recordId);
                })
                .catch(error => {
                    Toast.show({
                        variant: 'error',
                        message: `Error deleting record: ${error.body.message}`,
                    }, this);
                });
        }else if(tempId){
            this.records = this.records.filter(record => record.tempid !== tempId);
        }
    }

    handleFieldChange(event) {
        const fieldName = event.target.dataset.fieldname;
        const value = event.target.value;
        const recordId = event.target.dataset.tempid;
    
        // Update the records array with the changed field value for the corresponding record
        this.records = this.records.map(record => {
            if (record.tempid === recordId) {
                return {
                    ...record,
                    fields: {
                        ...record.fields,
                        [fieldName]: value,
                    },
                };
            }
            return record;
        });
        this.applyFieldConditions();
    }

    applyFieldConditions() {
        if (this.fieldConditions && this.fieldConditions.length > 0 && this.records && this.records.length > 0) {
            this.fieldConditions.forEach(condition => {
                const fieldName = condition.fieldName;
                // Check if the condition has a value before transforming
            this.hiddenConditions[fieldName] = condition.hiddenCondition ? this.transformCondition(condition.hiddenCondition) : '';
            this.readonlyConditions[fieldName] = condition.readonlyCondition ? this.transformCondition(condition.readonlyCondition) : '';
            this.mandatoryConditions[fieldName] = condition.mandatoryCondition ? this.transformCondition(condition.mandatoryCondition) : '';
           
                // Iterate through the records and apply conditions to each record
                this.records.forEach(record => {
                    const recordId = record.tempid;
                    const isHiddenConditionMet = this.evaluateCondition(record.fields, this.hiddenConditions[fieldName]);
                    const isReadonlyConditionMet = this.evaluateCondition(record.fields, this.readonlyConditions[fieldName]);
                    const isMandatoryConditionMet = this.evaluateCondition(record.fields, this.mandatoryConditions[fieldName]);
                    this.applyConditionResults(recordId, fieldName, isHiddenConditionMet, isReadonlyConditionMet, isMandatoryConditionMet);
                });
            });
        }
    }

    transformCondition(condition) {
        // Replace '[' with an empty string and add 'recordFields.' with word boundaries
        return condition ? condition.replace(/\[/g, 'recordFields.').replace(/\]/g, '') : '';
    }
    
    evaluateCondition(recordFields, condition) {
        try {
           // Create a dynamic function with the condition and execute it
            const dynamicFunction = new Function('recordFields', `return ${condition};`);
            return dynamicFunction(recordFields);
        } catch (error) {
            console.error('Error evaluating condition:', error);
            return false; // Handle condition evaluation errors
        }
    }

    applyConditionResults(recordId, fieldName, isHiddenConditionMet, isReadonlyConditionMet, isMandatoryConditionMet) {
        // Assuming you have logic to find and manipulate the relevant elements in your component
        const fieldElement = this.template.querySelector(`[data-fieldname="${fieldName}"][data-tempid="${recordId}"]`);
        // Apply the condition results to hide/display and make fields readonly
        if (fieldElement) {
            fieldElement.style.display = isHiddenConditionMet ? 'none' : '';
            fieldElement.disabled = isReadonlyConditionMet;
            fieldElement.required = isMandatoryConditionMet;
        }
    }

}