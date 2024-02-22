import json
import subprocess

image_list = [
    'serverless/content',
]

keep_tag_num = 10

prod_tags = []

def image_with_prod_tag(image):
    if 'imageTags' not in image:
        return False
    for tag in image['imageTags']:
        if 'prod' in tag:
            prod_tags.append(tag)
            return True
    return False


def image_without_prod_tag(image):
    if 'imageTags' not in image:
        return False
    for tag in image['imageTags']:
        if 'prod' in tag or 'prod-' + tag in prod_tags:
            return False
    return True

def image_untag(image):
    return 'imageTags' not in image

def clean_ecr_images():
    print('begin to clean ecr images')
    repositories = json.loads(subprocess.check_output(['aws', 'ecr', 'describe-repositories']))
    # Iterate over the repositories and retrieve image details
    for repo in repositories['repositories']:
        if repo['repositoryName'] not in image_list:
            continue
        prod_tags = []
        repo_name = repo['repositoryName']
        print(f'aws ecr describe-images --repository-name {repo_name}')
        images = json.loads(subprocess.check_output(['aws', 'ecr', 'describe-images', '--repository-name', repo_name]))['imageDetails']
       
        prod_images = list(filter(image_with_prod_tag, images))
        other_images = list(filter(image_without_prod_tag, images))
        untag_images = list(filter(image_untag, images))

        if untag_images:
            imageDigest = [image['imageDigest'] for image in untag_images]
            delete_ecr_image_by_digests(repo_name=repo_name, digests=imageDigest)

        if prod_images:
            prod_images.sort(key= lambda x: x['imagePushedAt'])

        if other_images:
            other_images.sort(key= lambda x: x['imagePushedAt'])

        if prod_images and len(prod_images) > keep_tag_num:
            tags = [image['imageTags'][0] for image in prod_images[:-keep_tag_num]]
            delete_ecr_image_by_tags(repo_name=repo_name, tags=tags, tagType='prod')

        if other_images and len(other_images) > keep_tag_num:
            tags = [image['imageTags'][0] for image in other_images[:-keep_tag_num]]
            delete_ecr_image_by_tags(repo_name=repo_name, tags=tags, tagType='others')

def delete_ecr_image_by_digests(repo_name, digests):
    l = len(digests)
    k = 0
    while k < l:
        if k + 50 < l:
            ptag = " imageDigest=".join(digests[k:k+50])
        else:
            ptag = " imageDigest=".join(digests[k:l])
        print(f'aws ecr batch-delete-image --repository-name {repo_name} --image-ids imageDigest={ptag}')
        res = subprocess.Popen(f'aws ecr batch-delete-image --repository-name {repo_name} --image-ids imageDigest={ptag}', shell=True, stdout=subprocess.PIPE).stdout.read()
        print(res)
        k += 50

def delete_ecr_image_by_tags(repo_name, tags, tagType):
    l = len(tags)
    k = 0
    while k < l:
        if k + 50 < l:
            ptag = " imageTag=".join(tags[k:k+50])
        else:
            ptag = " imageTag=".join(tags[k:l])
        print(f'aws ecr batch-delete-image --repository-name {repo_name} --image-ids imageTag={ptag}, tag type {tagType}')
        res = subprocess.Popen(f'aws ecr batch-delete-image --repository-name {repo_name} --image-ids imageTag={ptag}', shell=True, stdout=subprocess.PIPE).stdout.read()
        print(res)
        k += 50
        

if __name__ == '__main__':
    clean_ecr_images()
