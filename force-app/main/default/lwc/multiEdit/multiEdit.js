import { LightningElement, wire, api } from 'lwc';

export default class MultiEdit extends LightningElement {
    error;
    records;
    @api recordId;
    @api relatedListObject;
    @api relatedListLabel;
    @api fieldsString; // Accept comma-separated fields as a string
    @api relatedObjectApiName;
    @api parentField;

    get fieldsArray() {
        const fieldsWithoutApiName = this.fieldsString ? this.fieldsString.split(',').map(field => field.trim()) : [];
        const fieldsWithApiName = fieldsWithoutApiName.map(field => `${this.relatedObjectApiName}.${field}`);
        return fieldsWithApiName;
    }
    
}
