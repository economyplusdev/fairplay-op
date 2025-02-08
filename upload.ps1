param (
    [string]$CommitMessage
)

if (-not $CommitMessage) {
    Write-Host "Please provide a commit message."
    exit
}

if (-not (Test-Path ".git")) {
    git init
    Write-Host "Enter your GitHub repository URL (e.g., https://github.com/username/repository.git):"
    $RepoUrl = Read-Host
    git remote add origin $RepoUrl
}

# List of directories and files to remove before uploading
$ItemsToRemove = @(
    # Add files or directories here, e.g., "file1.txt", "folder1"
)

foreach ($Item in $ItemsToRemove) {
    if (git ls-files --error-unmatch $Item 2>$null) {
        git rm -r --cached $Item
        Write-Host "Removed $Item from tracking"
    } else {
        Write-Host "Skipping $($Item): Not tracked by Git"
    }
}

git add .
git commit -m $CommitMessage
git push -u origin main
