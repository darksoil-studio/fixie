use fixie_integrity::*;
use hdk::prelude::*;

#[hdk_extern]
pub fn get_open_issues() -> ExternResult<Vec<Link>> {
    let path = Path::from("open_issues");
    get_links(
        GetLinksInputBuilder::try_new(path.path_entry_hash()?, LinkTypes::OpenIssues)?.build(),
    )
}
