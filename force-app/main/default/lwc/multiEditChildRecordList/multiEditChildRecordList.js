import { LightningElement, api, wire } from 'lwc';
import { getRelatedListRecords } from 'lightning/uiRelatedListApi';
import MyModal from 'c/multiEditModal';

export default class MultiEditChildRecordList extends LightningElement {
    error;
    records;
    @api parentRecordId;
    @api relatedListId;
    @api fieldsString; // Accept comma-separated fields as a string
    @api fieldsToDisplay;
    @api relatedObjectApiName;
    @api relatedListLabel;
    @api parentField;
    @api relatedListObject;

    @wire(getRelatedListRecords, {
        parentRecordId: '$parentRecordId',
        relatedListId: '$relatedListId',
        fields: '$fieldsToDisplay',
    })
    listInfo({ error, data }) {
        if (data) {
          this.records = data.records.map((record) => ({
            ...record,
            fields: Object.fromEntries(
              Object.entries(record.fields).map(([field, value]) => [field, value.value])
            ),
          }));
          this.error = undefined;
        } else if (error) {
          this.error = error;
          this.records = undefined;
        }
      }

      get formattedFieldValue() {
        return this.fieldsToDisplay.map((field) => {
            return this.records.map((rec) => {
                const fieldValue = rec.fields[field] ? rec.fields[field].value : '';
                return fieldValue;
            });
        });
    }

    get computeGridClass() {
        const numberOfFields = this.fieldsToDisplay.length;
        const gridClass = `slds-col slds-align_absolute-center slds-size_1-of-${numberOfFields + 1}`;
        return gridClass;
    }

    get computeGridClass2() {
        const numberOfFields = this.fieldsToDisplay.length;
        const gridClass = `slds-col slds-align_absolute-center slds-m-top_large slds-size_1-of-${numberOfFields + 1}`;
        return gridClass;
    }

    get fieldNames() {
        return this.fieldsToDisplay.map(field => {
            // Split the field name by dot and return the last part
            return field.split('.').pop();
        });
    }

    get extractedFields() {
        // Use map to transform each element in the array
        return this.fieldsToDisplay.map(fieldString => {
            const parts = fieldString.split('.');
            if (parts.length === 2) {
                const isParentField = parts[1] === this.parentField;
                return { name: parts[1], isParentField: isParentField };
            } else {
                // Handle invalid input
                console.error(`Invalid input format: ${fieldString}. Expected "Object.Field"`);
                return null;
            }
        }).filter(Boolean); // Remove null values from the resulting array
    }
     
     async handleEditRecord(event) {
        const records = this.records;
        // Implement your edit logic here
        const result = await MyModal.open({
            size: 'large',
            description: 'Accessible description of modal\'s purpose',
            content: 'Passed into content api',
            records,  // Use the variable directly, not as a string
            computeGridClass: this.computeGridClass,
            computeGridClass2: this.computeGridClass2,
            extractedFields: this.extractedFields,
            relatedListId : this.relatedListId,
            parentField : this.parentField,
            parentRecordId : this.parentRecordId,
            relatedObjectApiName : this.relatedObjectApiName,
        });
    }
}