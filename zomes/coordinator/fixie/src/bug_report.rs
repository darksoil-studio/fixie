use fixie_integrity::*;
use hdk::prelude::*;

#[hdk_extern]
pub fn create_bug_report(bug_report: BugReport) -> ExternResult<Record> {
    let bug_report_hash = create_entry(&EntryTypes::BugReport(bug_report.clone()))?;
    let record = get(bug_report_hash.clone(), GetOptions::default())?.ok_or(wasm_error!(
        WasmErrorInner::Guest("Could not find the newly created BugReport".to_string())
    ))?;
    Ok(record)
}

#[hdk_extern]
pub fn get_bug_report(bug_report_hash: ActionHash) -> ExternResult<Option<Record>> {
    let Some(details) = get_details(bug_report_hash, GetOptions::default())? else {
        return Ok(None);
    };
    match details {
        Details::Record(details) => Ok(Some(details.record)),
        _ => Err(wasm_error!(WasmErrorInner::Guest(
            "Malformed get details response".to_string()
        ))),
    }
}
