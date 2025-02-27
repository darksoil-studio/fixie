use fixie_integrity::*;
use hdk::prelude::*;

#[hdk_extern]
pub fn get_untriaged_bug_reports() -> ExternResult<Vec<Link>> {
    let path = Path::from("untriaged_bug_reports");
    get_links(
        GetLinksInputBuilder::try_new(path.path_entry_hash()?, LinkTypes::UntriagedBugReports)?
            .build(),
    )
}
