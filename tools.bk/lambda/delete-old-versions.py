import boto3

def delete_functions(client, functions):
    for function in functions:
        arn = function['FunctionArn']
        print(arn)
        all_versions = []

        versions = client.list_versions_by_function(
            FunctionName=arn)
        # Page through all the versions
        while True:
            page_versions = [int(v['Version']) for v in versions['Versions'] if not v['Version'] == '$LATEST']
            all_versions.extend(page_versions)
            try:
                marker = versions['NextMarker']
            except:
                break
            versions = client.list_versions_by_function(
                FunctionName=arn, Marker=marker)

        # Sort and keep the last 2
        all_versions.sort()
        print('Which versions must go?')
        print(all_versions[0:-2])
        print('Which versions will live')
        print(all_versions[-2::])
        for chopBlock in all_versions[0:-2]:
            functionArn = '{}:{}'.format(arn, chopBlock)
            print('will run: delete_function(FunctionName={})'.format(functionArn))
            # I want to leave this commented in Git for safety so we don't run it unscrupulously
            try:
                client.delete_function(FunctionName=functionArn)  # uncomment me once you've checked
            except Exception as e:
                print(e)
                continue


def clean_old_lambda_versions(client):
    marker = None
    while True:
        response = client.list_functions(Marker=marker) if marker else client.list_functions()
        functions = response['Functions']
        marker = response.get('NextMarker')
        delete_functions(client, functions)
        if not marker:
            break
    
if __name__ == '__main__':
    east_client = boto3.client('lambda', region_name='us-east-1')
    clean_old_lambda_versions(east_client)

    west_client = boto3.client('lambda', region_name='us-west-2')
    clean_old_lambda_versions(west_client)
