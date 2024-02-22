import json
import subprocess

# Retrieve the list of ECR repositories
repositories = json.loads(subprocess.check_output(['aws', 'ecr', 'describe-repositories']))

# List to store repository names and total sizes
repository_sizes = []

# Iterate over the repositories and retrieve image details
for repo in repositories['repositories']:
    repo_name = repo['repositoryName']
    images = json.loads(subprocess.check_output(['aws', 'ecr', 'describe-images', '--repository-name', repo_name]))

    # Calculate the total size of all images in the repository
    total_size = sum(image['imageSizeInBytes'] for image in images['imageDetails'])

    # Convert total size to gigabytes
    total_size_gb = total_size / (1024 * 1024 * 1024)

    # Append repository name and total size to the list
    repository_sizes.append((repo_name, total_size_gb))

# Sort the repository sizes in descending order based on total size
sorted_repository_sizes = sorted(repository_sizes, key=lambda x: x[1], reverse=True)

# Print the sorted repository sizes
for repo_name, total_size_gb in sorted_repository_sizes:
    print(f'Repository: {repo_name}, Total Size: {total_size_gb:.2f} GB')
